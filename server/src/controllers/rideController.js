import { Ride } from '../models/Ride.js';
import { Driver } from '../models/Driver.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { AppError } from '../utils/AppError.js';
import { fareService } from '../services/fareService.js';
import { geoService, calculateDistanceKm } from '../services/geoService.js';
import { kafkaProducerService } from '../services/kafkaProducer.js';
import { emitToDriver, emitToUser, emitToRide, emitToFleet } from '../services/socketService.js';

export const estimateFare = async (req, res, next) => {
  try {
    const { pickupLng, pickupLat, destLng, destLat, pickupAddress, destAddress } = req.body;

    if (!pickupLng || !pickupLat || !destLng || !destLat) {
      return next(new AppError('Pickup and Destination coordinates are required', 400));
    }

    const distanceKm = calculateDistanceKm(pickupLat, pickupLng, destLat, destLng);
    const durationMins = Math.max(Math.round((distanceKm / 25) * 60) + 3, 4);

    const fareEstimates = await fareService.estimateAllFares(distanceKm, durationMins, pickupLat, pickupLng);
    
    // Fetch real nearby drivers within 20 km
    const allNearbyDrivers = await geoService.findNearbyDrivers(pickupLng, pickupLat, 20);

    // Group real available count per category
    const countsPerCategory = {
      Moto: 0,
      Auto: 0,
      Mini: 0,
      Sedan: 0,
      SUV: 0,
      Electric: 0
    };

    for (const d of allNearbyDrivers) {
      const vType = d.vehicle?.type;
      if (vType && countsPerCategory[vType] !== undefined) {
        countsPerCategory[vType]++;
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        distanceKm,
        durationMins,
        pickup: { address: pickupAddress || 'Pickup Location', coordinates: [pickupLng, pickupLat] },
        destination: { address: destAddress || 'Destination', coordinates: [destLng, destLat] },
        nearbyDriversCount: allNearbyDrivers.length,
        driverCountsByType: countsPerCategory,
        estimates: fareEstimates.estimates,
        surgeMultiplier: fareEstimates.surgeMultiplier
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createRide = async (req, res, next) => {
  try {
    const {
      pickup,
      destination,
      vehicleType = 'Mini',
      routePolyline = [],
      paymentMethod = 'CASH'
    } = req.body;

    if (!pickup?.location?.coordinates || !destination?.location?.coordinates) {
      return next(new AppError('Pickup and Destination locations are required', 400));
    }

    // Check if rider already has an active ride
    const activeExistingRide = await Ride.findOne({
      rider: req.user.id,
      status: { $in: ['REQUESTED', 'SEARCHING', 'ACCEPTED', 'ARRIVING', 'ARRIVED', 'IN_PROGRESS'] }
    });

    if (activeExistingRide) {
      return next(new AppError('You already have an active ride in progress.', 400));
    }

    const [pLng, pLat] = pickup.location.coordinates;
    const [dLng, dLat] = destination.location.coordinates;

    const distanceKm = calculateDistanceKm(pLat, pLng, dLat, dLng);
    const durationMins = Math.max(Math.round((distanceKm / 25) * 60) + 3, 4);
    const surge = await fareService.getSurgeMultiplier(pLat, pLng);
    const fare = fareService.calculateCategoryFare(vehicleType, distanceKm, durationMins, surge);

    const ride = await Ride.create({
      rider: req.user.id,
      pickup,
      destination,
      vehicleType,
      distanceKm,
      durationMins,
      routePolyline,
      fare,
      paymentMethod,
      status: 'SEARCHING'
    });

    const populatedRide = await Ride.findById(ride._id).populate('rider', 'name phone rating avatar');

    kafkaProducerService.streamRideRequest(populatedRide);

    const nearbyDrivers = await geoService.findNearbyDrivers(pLng, pLat, 20, vehicleType);

    for (const driver of nearbyDrivers) {
      emitToDriver(driver._id.toString(), 'driver:ride:offer', {
        ride: populatedRide,
        distanceToPickupKm: driver.distanceKm,
        expiresInSeconds: 30
      });
    }

    emitToFleet('fleet:ride:created', populatedRide);

    res.status(201).json({
      status: 'success',
      data: {
        ride: populatedRide,
        notifiedDriversCount: nearbyDrivers.length
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getActiveRide = async (req, res, next) => {
  try {
    let query = {
      status: { $in: ['REQUESTED', 'SEARCHING', 'ACCEPTED', 'ARRIVING', 'ARRIVED', 'IN_PROGRESS'] }
    };

    if (req.user.role === 'driver') {
      const driver = await Driver.findOne({ user: req.user.id });
      if (!driver) return res.status(200).json({ status: 'success', data: { ride: null } });
      query.driver = driver._id;
    } else {
      query.rider = req.user.id;
    }

    const ride = await Ride.findOne(query)
      .populate('rider', 'name phone rating avatar')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name phone rating avatar' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: { ride }
    });
  } catch (err) {
    next(err);
  }
};

export const getRideById = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('rider', 'name phone rating avatar')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name phone rating avatar' }
      });

    if (!ride) {
      return next(new AppError('Ride not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { ride }
    });
  } catch (err) {
    next(err);
  }
};

export const cancelRide = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return next(new AppError('Ride not found', 404));
    }

    if (['COMPLETED', 'CANCELLED'].includes(ride.status)) {
      return next(new AppError(`Cannot cancel a ride that is already ${ride.status.toLowerCase()}`, 400));
    }

    ride.status = 'CANCELLED';
    ride.cancelledBy = req.user.role;
    ride.cancellationReason = reason || 'Cancelled by user';
    ride.timeline.cancelledAt = new Date();
    await ride.save();

    if (ride.driver) {
      const driver = await Driver.findById(ride.driver);
      if (driver) {
        driver.status = 'ONLINE';
        driver.activeRide = null;
        await driver.save();
        emitToDriver(driver._id.toString(), 'ride:cancelled', { rideId: ride._id, reason });
      }
    }

    kafkaProducerService.streamRideStatus(ride._id, 'CANCELLED', { cancelledBy: req.user.role, reason });
    emitToRide(ride._id.toString(), 'ride:cancelled', { rideId: ride._id, reason });
    emitToUser(ride.rider.toString(), 'ride:cancelled', { rideId: ride._id, reason });

    res.status(200).json({
      status: 'success',
      data: { ride }
    });
  } catch (err) {
    next(err);
  }
};

export const dismissRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return next(new AppError('Ride not found', 404));
    }

    // If ride is completed, cancelled or stuck in progress, force complete and release lock
    if (['IN_PROGRESS', 'ACCEPTED', 'ARRIVED', 'SEARCHING', 'REQUESTED'].includes(ride.status)) {
      ride.status = 'COMPLETED';
      ride.timeline.completedAt = new Date();
      ride.paymentStatus = 'PAID';
      await ride.save();

      if (ride.driver) {
        await Driver.findByIdAndUpdate(ride.driver, {
          status: 'ONLINE',
          activeRide: null
        });
      }
    }

    emitToRide(ride._id.toString(), 'ride:completed', { ride });
    emitToUser(ride.rider.toString(), 'ride:completed', { ride });

    res.status(200).json({
      status: 'success',
      message: 'Ride dismissed successfully',
      data: { ride }
    });
  } catch (err) {
    next(err);
  }
};

export const rateRide = async (req, res, next) => {
  try {
    const { score, review } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return next(new AppError('Ride not found', 404));
    }

    if (req.user.role === 'rider') {
      ride.rating.riderScore = score;
      ride.rating.riderReview = review || '';

      if (ride.driver) {
        const driver = await Driver.findById(ride.driver).populate('user');
        if (driver) {
          const newAvg = Number(((driver.rating * driver.totalTrips + score) / (driver.totalTrips + 1)).toFixed(1));
          driver.rating = newAvg;
          await driver.save();
        }
      }
    } else if (req.user.role === 'driver') {
      ride.rating.driverScore = score;
      ride.rating.driverReview = review || '';

      const rider = await User.findById(ride.rider);
      if (rider) {
        const count = rider.ratingCount || 1;
        rider.rating = Number(((rider.rating * count + score) / (count + 1)).toFixed(1));
        rider.ratingCount = count + 1;
        await rider.save();
      }
    }

    await ride.save();

    res.status(200).json({
      status: 'success',
      data: { ride }
    });
  } catch (err) {
    next(err);
  }
};

export const getRideHistory = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'driver') {
      const driver = await Driver.findOne({ user: req.user.id });
      if (!driver) return res.status(200).json({ status: 'success', data: { rides: [] } });
      query.driver = driver._id;
    } else if (req.user.role === 'rider') {
      query.rider = req.user.id;
    }

    const rides = await Ride.find(query)
      .populate('rider', 'name phone avatar')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name phone avatar' }
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      status: 'success',
      results: rides.length,
      data: { rides }
    });
  } catch (err) {
    next(err);
  }
};
