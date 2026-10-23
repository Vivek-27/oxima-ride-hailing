import { Driver } from '../models/Driver.js';
import { Ride } from '../models/Ride.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { fareService } from '../services/fareService.js';
import { getKafkaStatus } from '../config/kafka.js';
import { redisClient } from '../config/redis.js';
import { AppError } from '../utils/AppError.js';
import { INDIAN_CITIES_REGISTRY } from '../config/cities/index.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'rider' });
    const totalDrivers = await Driver.countDocuments();
    const activeDrivers = await Driver.countDocuments({ status: { $in: ['ONLINE', 'BUSY', 'ON_TRIP'] } });
    const totalRides = await Ride.countDocuments();
    const completedRides = await Ride.countDocuments({ status: 'COMPLETED' });
    const activeRidesCount = await Ride.countDocuments({
      status: { $in: ['REQUESTED', 'SEARCHING', 'ACCEPTED', 'ARRIVING', 'ARRIVED', 'IN_PROGRESS'] }
    });

    // Real-time Gross Volume: sum of all completed ride fares
    const rideRevenueResult = await Ride.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, totalFareSum: { $sum: '$fare.totalFare' } } }
    ]);
    const grossVolume = rideRevenueResult[0]?.totalFareSum || 0;
    const platformRevenue = Number((grossVolume * 0.15).toFixed(2));

    const citySurges = await fareService.getAllCitySurges();

    const kafkaStatus = getKafkaStatus();
    const redisStatus = redisClient.status === 'ready' ? 'Connected' : 'Disconnected';

    // Recent active rides
    const activeRides = await Ride.find({
      status: { $in: ['REQUESTED', 'SEARCHING', 'ACCEPTED', 'ARRIVING', 'ARRIVED', 'IN_PROGRESS'] }
    })
      .populate('rider', 'name phone')
      .populate({
        path: 'driver',
        populate: { path: 'user', select: 'name phone' }
      })
      .sort({ createdAt: -1 })
      .limit(15);

    // Fleet drivers
    const drivers = await Driver.find()
      .populate('user', 'name email phone avatar rating')
      .sort({ updatedAt: -1 })
      .limit(50);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalDrivers,
          activeDrivers,
          totalRides,
          completedRides,
          activeRidesCount,
          grossVolume: Number(grossVolume.toFixed(2)),
          platformRevenue,
          citySurges
        },
        services: {
          kafka: kafkaStatus,
          redis: redisStatus,
          mongodb: 'Connected'
        },
        activeRides,
        drivers
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getCitySurges = async (req, res, next) => {
  try {
    const surges = await fareService.getAllCitySurges();
    res.status(200).json({
      status: 'success',
      data: {
        cities: surges
      }
    });
  } catch (err) {
    next(err);
  }
};

export const setSurgeMultiplier = async (req, res, next) => {
  try {
    const { cityId = 'all_india', multiplier = 1.0 } = req.body;
    const numMultiplier = parseFloat(multiplier);

    if (isNaN(numMultiplier) || numMultiplier < 1.0 || numMultiplier > 5.0) {
      return next(new AppError('Surge multiplier must be between 1.0 and 5.0', 400));
    }

    const updated = await fareService.setCitySurge(cityId, numMultiplier);

    res.status(200).json({
      status: 'success',
      message: numMultiplier > 1.0
        ? `Surge set to ${numMultiplier}x for ${updated.cityName} (Active for 3 Hours)`
        : `Surge reset to 1.0x for ${updated.cityName}`,
      data: {
        surgeRecord: updated
      }
    });
  } catch (err) {
    next(err);
  }
};

export const toggleDriverVerification = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return next(new AppError('Driver not found', 404));
    }

    driver.documents.isVerified = !driver.documents.isVerified;
    await driver.save();

    res.status(200).json({
      status: 'success',
      data: { driver }
    });
  } catch (err) {
    next(err);
  }
};
