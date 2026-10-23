import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Driver } from '../models/Driver.js';
import { AppError } from '../utils/AppError.js';
import { Transaction } from '../models/Transaction.js';

const signToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'oxima_super_secure_jwt_secret_key_2026_dev_mode',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, vehicle, upiId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email is already registered. Please login.', 400));
    }

    if (role === 'driver') {
      if (!vehicle?.rcNumber) {
        return next(new AppError('Vehicle RC number is required for driver registration.', 400));
      }
      const existingRC = await Driver.findOne({ 'vehicle.rcNumber': vehicle.rcNumber.toUpperCase() });
      if (existingRC) {
        return next(new AppError('A vehicle with this RC Number is already registered.', 400));
      }
      const existingPlate = await Driver.findOne({ 'vehicle.licensePlate': (vehicle.licensePlate || '').toUpperCase() });
      if (existingPlate) {
        return next(new AppError('A vehicle with this License Plate is already registered.', 400));
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'rider',
      walletBalance: 0
    });

    let driver = null;
    if (user.role === 'driver') {
      driver = await Driver.create({
        user: user._id,
        vehicle: {
          make: vehicle?.make || 'Maruti Suzuki',
          model: vehicle?.model || 'Dzire',
          year: vehicle?.year || 2023,
          color: vehicle?.color || 'White',
          licensePlate: (vehicle?.licensePlate || 'DL-01-AB-1234').toUpperCase(),
          rcNumber: vehicle.rcNumber.toUpperCase(),
          type: vehicle?.type || 'Economy'
        },
        upiId: upiId || '',
        status: 'OFFLINE',
        currentLocation: {
          type: 'Point',
          coordinates: [77.2090, 28.6139] // Delhi NCR default
        }
      });
    }

    const token = signToken(user._id, user.role);
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user,
        driver
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    let driver = null;
    if (user.role === 'driver') {
      driver = await Driver.findOne({ user: user._id });
    }

    const token = signToken(user._id, user.role);
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
        driver
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let driver = null;
    if (user.role === 'driver') {
      driver = await Driver.findOne({ user: user._id });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
        driver
      }
    });
  } catch (err) {
    next(err);
  }
};

export const topupWallet = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    user.walletBalance += parseFloat(amount || 0);
    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        walletBalance: user.walletBalance
      }
    });
  } catch (err) {
    next(err);
  }
};
