import { Driver } from '../models/Driver.js';
import { Ride } from '../models/Ride.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { AppError } from '../utils/AppError.js';
import { geoService, calculateDistanceKm } from '../services/geoService.js';
import { kafkaProducerService } from '../services/kafkaProducer.js';
import { emitToUser, emitToRide, emitToFleet } from '../services/socketService.js';

export const getDriverProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id }).populate('user', 'name email phone avatar rating');
    if (!driver) {
      return next(new AppError('Driver profile not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { driver }
    });
  } catch (err) {
    next(err);
  }
};

export const updateDriverProfile = async (req, res, next) => {
  try {
    const { upiId, vehicle } = req.body;
    const driver = await Driver.findOne({ user: req.user.id });

    if (!driver) {
      return next(new AppError('Driver profile not found', 404));
    }

    if (upiId !== undefined) {
      driver.upiId = upiId.trim();
    }

    if (vehicle) {
      if (vehicle.rcNumber && vehicle.rcNumber.toUpperCase() !== driver.vehicle.rcNumber) {
        const existingRC = await Driver.findOne({ 'vehicle.rcNumber': vehicle.rcNumber.toUpperCase() });
        if (existingRC) {
          return next(new AppError('Another vehicle with this RC Number already exists.', 400));
        }
        driver.vehicle.rcNumber = vehicle.rcNumber.toUpperCase();
      }
      if (vehicle.licensePlate) {
        driver.vehicle.licensePlate = vehicle.licensePlate.toUpperCase();
      }
      if (vehicle.make) driver.vehicle.make = vehicle.make;
      if (vehicle.model) driver.vehicle.model = vehicle.model;
      if (vehicle.type) driver.vehicle.type = vehicle.type;
      if (vehicle.color) driver.vehicle.color = vehicle.color;
    }

    await driver.save();

    res.status(200).json({
      status: 'success',
      message: 'Driver profile updated successfully',
      data: { driver }
    });
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ONLINE', 'OFFLINE'].includes(status)) {
      return next(new AppError('Status must be either ONLINE or OFFLINE', 400));
    }

    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return next(new AppError('Driver profile not found', 404));
    }

    if (driver.status === 'ON_TRIP' && status === 'OFFLINE') {
      return next(new AppError('Cannot go offline while on an active trip', 400));
    }

    driver.status = status;
    await driver.save();

    if (status === 'OFFLINE') {
      await geoService.removeDriverLocation(driver._id);
    } else {
      const [lng, lat] = driver.currentLocation.coordinates;
      await geoService.updateDriverLocation(driver._id, lng, lat, driver.currentHeading, 'ONLINE');
    }

    emitToFleet('fleet:driver:status', { driverId: driver._id, status });

    res.status(200).json({
      status: 'success',
      data: { driver }
    });
  } catch (err) {
    next(err);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { longitude, latitude, heading = 0 } = req.body;
    if (longitude === undefined || latitude === undefined) {
      return next(new AppError('Coordinates are required', 400));
    }

    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return next(new AppError('Driver profile not found', 404));
    }

    await geoService.updateDriverLocation(driver._id, longitude, latitude, heading, driver.status);

    res.status(200).json({
      status: 'success',
      message: 'Location updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

export const acceptRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const driver = await Driver.findOne({ user: req.user.id }).populate('user', 'name phone rating avatar');

    if (!driver) {
      return next(new AppError('Driver profile not found', 404));
    }

    const ride = await Ride.findById(rideId).populate('rider', 'name phone rating avatar');
    if (!ride) {
      return next(new AppError('Ride not found', 404));
    }

    if (ride.status !== 'SEARCHING' && ride.status !== 'REQUESTED') {
      return next(new AppError('Ride is no longer available', 400));
    }

    ride.driver = driver._id;
    ride.status = 'ACCEPTED';
    ride.timeline.acceptedAt = new Date();
    await ride.save();

    driver.status = 'BUSY';
    driver.activeRide = ride._id;
    await driver.save();

    const populatedRide = await Ride.findById(ride._id)
      .populate('rider', 'name phone rating avatar')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name phone rating avatar' }
      });

    kafkaProducerService.streamRideStatus(ride._id, 'ACCEPTED', { driverId: driver._id });

    emitToUser(ride.rider._id.toString(), 'ride:accepted', {
      ride: populatedRide,
      driver
    });

    emitToRide(ride._id.toString(), 'ride:accepted', {
      ride: populatedRide,
      driver
    });

    res.status(200).json({
      status: 'success',
      data: { ride: populatedRide }
    });
  } catch (err) {
    next(err);
  }
};

export const arriveAtPickup = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return next(new AppError('Ride not found', 404));
    }

    ride.status = 'ARRIVED';
    ride.timeline.arrivedAt = new Date();
    await ride.save();

    kafkaProducerService.streamRideStatus(ride._id, 'ARRIVED');
    emitToUser(ride.rider.toString(), 'ride:arrived', { rideId: ride._id });
    emitToRide(ride._id.toString(), 'ride:arrived', { rideId: ride._id });

    res.status(200).json({
      status: 'success',
      data: { ride }
    });
  } catch (err) {
    next(err);
  }
};

export const startRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const { otp, driverCoords } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return next(new AppError('Ride not found', 404));
    }

    // Check distance between driver and pickup location (within 20m or GPS tolerance)
    const driver = await Driver.findOne({ user: req.user.id });
    const driverLoc = driverCoords || driver?.currentLocation?.coordinates;
    const pickupLoc = ride.pickup?.location?.coordinates;

    if (driverLoc && pickupLoc) {
      const distKm = calculateDistanceKm(driverLoc[1], driverLoc[0], pickupLoc[1], pickupLoc[0]);
      const distMeters = Math.round(distKm * 1000);
      
      // Proximity check: Must be within 50m (allowing 30m GPS drift)
      if (distMeters > 50) {
        return next(new AppError(`You are ${distMeters}m away. Arrive within 20m of pickup location to start the trip.`, 400));
      }
    }

    if (ride.otp !== String(otp).trim()) {
      return next(new AppError('Incorrect 4-digit PIN. Please ask the passenger for the PIN.', 400));
    }

    ride.status = 'IN_PROGRESS';
    ride.timeline.startedAt = new Date();
    await ride.save();

    await Driver.findByIdAndUpdate(ride.driver, { status: 'ON_TRIP' });

    kafkaProducerService.streamRideStatus(ride._id, 'IN_PROGRESS');
    emitToUser(ride.rider.toString(), 'ride:started', { rideId: ride._id });
    emitToRide(ride._id.toString(), 'ride:started', { rideId: ride._id });

    res.status(200).json({
      status: 'success',
      message: 'Trip started successfully',
      data: { ride }
    });
  } catch (err) {
    next(err);
  }
};

export const completeRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const { paymentMethod = 'CASH' } = req.body;

    const ride = await Ride.findById(rideId).populate('rider');

    if (!ride) {
      return next(new AppError('Ride not found', 404));
    }

    if (ride.status === 'COMPLETED') {
      return next(new AppError('Ride is already completed', 400));
    }

    ride.status = 'COMPLETED';
    ride.paymentStatus = 'PAID';
    ride.paymentMethod = paymentMethod;
    ride.timeline.completedAt = new Date();
    await ride.save();

    const totalFare = ride.fare.totalFare;
    const driverEarnings = Number((totalFare * 0.85).toFixed(2));

    const driver = await Driver.findById(ride.driver).populate('user');
    driver.status = 'ONLINE';
    driver.activeRide = null;
    driver.todayEarnings += driverEarnings;
    driver.totalEarnings += driverEarnings;
    driver.totalTrips += 1;
    await driver.save();

    // Create Transaction record
    await Transaction.create({
      user: driver.user._id,
      ride: ride._id,
      amount: driverEarnings,
      type: 'CREDIT',
      description: `Trip #${ride._id.toString().slice(-6)} collected via ${paymentMethod}`,
      status: 'COMPLETED'
    });

    kafkaProducerService.streamRideStatus(ride._id, 'COMPLETED');
    kafkaProducerService.streamBillingEvent(ride._id, {
      userId: ride.rider._id,
      amount: totalFare,
      driverCut: driverEarnings,
      paymentMethod
    });

    const completedRide = await Ride.findById(ride._id)
      .populate('rider', 'name phone rating avatar')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name phone rating avatar' }
      });

    emitToUser(ride.rider._id.toString(), 'ride:completed', {
      ride: completedRide,
      receipt: {
        totalFare,
        baseFare: ride.fare.baseFare,
        distanceFare: ride.fare.distanceFare,
        distanceKm: ride.distanceKm,
        durationMins: ride.durationMins,
        currency: 'INR'
      }
    });

    emitToRide(ride._id.toString(), 'ride:completed', { ride: completedRide });
    emitToFleet('fleet:ride:completed', { rideId: ride._id, fare: totalFare });

    res.status(200).json({
      status: 'success',
      message: 'Trip completed successfully',
      data: {
        ride: completedRide,
        earnings: driverEarnings
      }
    });
  } catch (err) {
    next(err);
  }
};
