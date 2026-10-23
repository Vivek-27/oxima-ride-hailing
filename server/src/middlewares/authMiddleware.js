import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Driver } from '../models/Driver.js';
import { AppError } from '../utils/AppError.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'oxima_super_secure_jwt_secret_key_2026_dev_mode');

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (!currentUser.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 403));
    }

    req.user = currentUser;

    // If driver, attach driver profile
    if (currentUser.role === 'driver') {
      const driverProfile = await Driver.findOne({ user: currentUser._id });
      req.driver = driverProfile;
    }

    next();
  } catch (err) {
    next(err);
  }
};
