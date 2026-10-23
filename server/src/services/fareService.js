import { redisClient } from '../config/redis.js';
import { INDIAN_CITIES_REGISTRY, detectCityFromCoords } from '../config/cities/index.js';
import { emitToFleet } from './socketService.js';

const THREE_HOURS_SEC = 3 * 3600; // 10,800 seconds
const THREE_HOURS_MS = 3 * 3600 * 1000;

// In-memory fallback if Redis is in standalone mode or reconnecting
const inMemoryCitySurges = new Map();

const VEHICLE_PRICING = {
  Moto: {
    baseFare: 20.0,
    perKm: 8.0,
    perMinute: 1.0,
    minFare: 25.0,
    capacity: 1,
    description: 'Fast single-rider bike / scooter'
  },
  Auto: {
    baseFare: 30.0,
    perKm: 11.0,
    perMinute: 1.5,
    minFare: 35.0,
    capacity: 3,
    description: 'Affordable auto rickshaw ride'
  },
  Mini: {
    baseFare: 50.0,
    perKm: 14.0,
    perMinute: 2.0,
    minFare: 60.0,
    capacity: 4,
    description: 'Everyday budget hatchback (WagonR, Swift)'
  },
  Sedan: {
    baseFare: 75.0,
    perKm: 17.0,
    perMinute: 2.5,
    minFare: 90.0,
    capacity: 4,
    description: 'Comfortable air-conditioned sedan (Dzire, Amaze)'
  },
  SUV: {
    baseFare: 110.0,
    perKm: 22.0,
    perMinute: 3.0,
    minFare: 140.0,
    capacity: 6,
    description: 'Spacious 6-seater SUV (Innova, Ertiga, Scorpio)'
  },
  Electric: {
    baseFare: 60.0,
    perKm: 15.0,
    perMinute: 2.0,
    minFare: 75.0,
    capacity: 4,
    description: 'Eco-friendly green electric cab (Tata Nexon/Tigor EV)'
  }
};

export const fareService = {
  /**
   * Get active surge multiplier for a location or city.
   * Reverts to 1.0x automatically after 3 hours.
   */
  async getSurgeMultiplier(pickupLat, pickupLng, preferredCity = null) {
    try {
      const cityId = preferredCity || detectCityFromCoords(pickupLat, pickupLng);

      // Check specific city surge in Redis
      if (redisClient.status === 'ready') {
        const cityData = await redisClient.get(`oxima:surge:city:${cityId}`);
        if (cityData) {
          const parsed = JSON.parse(cityData);
          if (parsed.expiresAt > Date.now()) {
            return parseFloat(parsed.multiplier) || 1.0;
          }
        }

        // Check global All India fallback
        const globalData = await redisClient.get('oxima:surge:city:all_india');
        if (globalData) {
          const parsed = JSON.parse(globalData);
          if (parsed.expiresAt > Date.now()) {
            return parseFloat(parsed.multiplier) || 1.0;
          }
        }
      }

      // Check in-memory fallback
      const inMem = inMemoryCitySurges.get(cityId) || inMemoryCitySurges.get('all_india');
      if (inMem && inMem.expiresAt > Date.now()) {
        return inMem.multiplier;
      }

      return 1.0;
    } catch (err) {
      console.warn('Surge fetch error:', err.message);
      return 1.0;
    }
  },

  /**
   * Set surge multiplier for a specific city for exactly 3 hours
   */
  async setCitySurge(cityId = 'all_india', multiplier = 1.0) {
    const numMultiplier = parseFloat(multiplier) || 1.0;
    const now = Date.now();
    const expiresAt = now + THREE_HOURS_MS;
    const cityName = INDIAN_CITIES_REGISTRY[cityId]?.name || 'All India (Global)';

    const surgeRecord = {
      cityId,
      cityName,
      multiplier: numMultiplier,
      activatedAt: now,
      expiresAt: numMultiplier > 1.0 ? expiresAt : now
    };

    if (numMultiplier <= 1.0) {
      // Reverted to 1.0x
      inMemoryCitySurges.delete(cityId);
      if (redisClient.status === 'ready') {
        await redisClient.del(`oxima:surge:city:${cityId}`);
      }
    } else {
      inMemoryCitySurges.set(cityId, surgeRecord);
      if (redisClient.status === 'ready') {
        await redisClient.set(
          `oxima:surge:city:${cityId}`,
          JSON.stringify(surgeRecord),
          'EX',
          THREE_HOURS_SEC
        );
      }
    }

    emitToFleet('fleet:surge:updated', {
      cityId,
      cityName,
      multiplier: numMultiplier,
      expiresAt: surgeRecord.expiresAt
    });

    return surgeRecord;
  },

  /**
   * Return all city surge statuses with remaining duration in minutes/hours
   */
  async getAllCitySurges() {
    const results = [];
    const now = Date.now();

    for (const [id, city] of Object.entries(INDIAN_CITIES_REGISTRY)) {
      let currentSurge = 1.0;
      let expiresAt = null;
      let remainingMinutes = 0;

      if (redisClient.status === 'ready') {
        try {
          const raw = await redisClient.get(`oxima:surge:city:${id}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.expiresAt > now) {
              currentSurge = parsed.multiplier;
              expiresAt = parsed.expiresAt;
              remainingMinutes = Math.max(0, Math.round((parsed.expiresAt - now) / 60000));
            }
          }
        } catch {}
      }

      if (currentSurge === 1.0 && inMemoryCitySurges.has(id)) {
        const inMem = inMemoryCitySurges.get(id);
        if (inMem.expiresAt > now) {
          currentSurge = inMem.multiplier;
          expiresAt = inMem.expiresAt;
          remainingMinutes = Math.max(0, Math.round((inMem.expiresAt - now) / 60000));
        }
      }

      results.push({
        id,
        name: city.name,
        state: city.state,
        center: city.center,
        multiplier: currentSurge,
        isActive: currentSurge > 1.0,
        expiresAt,
        remainingMinutes,
        remainingFormatted:
          remainingMinutes > 0
            ? `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m remaining`
            : 'Normal (1.0x)'
      });
    }

    return results;
  },

  calculateCategoryFare(vehicleType, distanceKm, durationMins, surgeMultiplier = 1.0) {
    const pricing = VEHICLE_PRICING[vehicleType] || VEHICLE_PRICING.Mini;
    const distanceFare = Number((distanceKm * pricing.perKm).toFixed(2));
    const timeFare = Number((durationMins * pricing.perMinute).toFixed(2));
    const rawTotal = (pricing.baseFare + distanceFare + timeFare) * surgeMultiplier;
    const totalFare = Number(Math.max(rawTotal, pricing.minFare).toFixed(2));

    return {
      vehicleType,
      baseFare: pricing.baseFare,
      distanceFare,
      timeFare,
      surgeMultiplier,
      totalFare,
      capacity: pricing.capacity,
      description: pricing.description,
      currency: 'INR'
    };
  },

  async estimateAllFares(distanceKm, durationMins, pickupLat, pickupLng) {
    const surge = await this.getSurgeMultiplier(pickupLat, pickupLng);
    const estimates = {};

    for (const type of Object.keys(VEHICLE_PRICING)) {
      estimates[type] = this.calculateCategoryFare(type, distanceKm, durationMins, surge);
    }

    return {
      distanceKm,
      durationMins,
      surgeMultiplier: surge,
      estimates
    };
  }
};
