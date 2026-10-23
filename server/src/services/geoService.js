import { redisClient } from '../config/redis.js';
import { Driver } from '../models/Driver.js';
import { logger } from '../utils/logger.js';

const DRIVERS_GEO_KEY = 'oxima:drivers:locations';
const DRIVER_METADATA_KEY = 'oxima:drivers:meta:';

// Haversine formula distance calculation in KM
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

export const geoService = {
  /**
   * Update driver location in Redis GEO and cache status
   */
  async updateDriverLocation(driverId, longitude, latitude, heading = 0, status = 'ONLINE') {
    try {
      if (redisClient.status === 'ready') {
        await redisClient.geoadd(DRIVERS_GEO_KEY, longitude, latitude, String(driverId));
        await redisClient.set(
          `${DRIVER_METADATA_KEY}${driverId}`,
          JSON.stringify({
            driverId,
            longitude,
            latitude,
            heading,
            status,
            updatedAt: Date.now()
          }),
          'EX',
          3600
        );
      }

      await Driver.findByIdAndUpdate(driverId, {
        currentLocation: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        currentHeading: heading,
        status
      });

      return true;
    } catch (error) {
      logger.warn(`Failed to update driver location in Redis: ${error.message}`);
      return false;
    }
  },

  /**
   * Remove driver from Redis GEO pool (e.g. when going OFFLINE)
   */
  async removeDriverLocation(driverId) {
    try {
      if (redisClient.status === 'ready') {
        await redisClient.zrem(DRIVERS_GEO_KEY, String(driverId));
        await redisClient.del(`${DRIVER_METADATA_KEY}${driverId}`);
      }
    } catch (err) {
      logger.warn(`Error removing driver from Redis GEO: ${err.message}`);
    }
  },

  /**
   * Find nearby available drivers within radiusKm (Default: 20 KM)
   */
  async findNearbyDrivers(longitude, latitude, radiusKm = 20, vehicleType = null) {
    try {
      let nearbyDriverIdsWithDist = [];

      if (redisClient.status === 'ready') {
        try {
          const results = await redisClient.georadius(
            DRIVERS_GEO_KEY,
            longitude,
            latitude,
            radiusKm,
            'km',
            'WITHCOORD',
            'WITHDIST',
            'ASC'
          );

          nearbyDriverIdsWithDist = results.map(([driverId, dist, coords]) => ({
            driverId,
            distanceKm: parseFloat(dist),
            coordinates: [parseFloat(coords[0]), parseFloat(coords[1])]
          }));
        } catch (e) {
          logger.warn(`Redis georadius error: ${e.message}`);
        }
      }

      if (nearbyDriverIdsWithDist.length > 0) {
        const driverIds = nearbyDriverIdsWithDist.map(d => d.driverId);
        const query = {
          _id: { $in: driverIds },
          status: 'ONLINE'
        };
        if (vehicleType) {
          query['vehicle.type'] = vehicleType;
        }

        const drivers = await Driver.find(query).populate('user', 'name phone rating avatar');
        const driverMap = new Map(drivers.map(d => [d._id.toString(), d]));

        return nearbyDriverIdsWithDist
          .filter(item => driverMap.has(item.driverId))
          .map(item => {
            const doc = driverMap.get(item.driverId);
            return {
              ...doc.toObject(),
              distanceKm: item.distanceKm,
              currentLocation: {
                type: 'Point',
                coordinates: item.coordinates
              }
            };
          });
      }

      // MongoDB fallback: 20 km search
      const mongoQuery = {
        status: 'ONLINE',
        currentLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radiusKm * 1000 // 20 km in meters
          }
        }
      };

      if (vehicleType) {
        mongoQuery['vehicle.type'] = vehicleType;
      }

      const drivers = await Driver.find(mongoQuery)
        .populate('user', 'name phone rating avatar')
        .limit(25);

      return drivers.map(d => {
        const [dLng, dLat] = d.currentLocation.coordinates;
        const dist = calculateDistanceKm(latitude, longitude, dLat, dLng);
        return {
          ...d.toObject(),
          distanceKm: dist
        };
      });
    } catch (error) {
      logger.error(`findNearbyDrivers error: ${error.message}`);
      return [];
    }
  }
};
