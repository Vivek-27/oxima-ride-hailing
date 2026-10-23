import { Transaction } from '../models/Transaction.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('ride', 'pickup destination distanceKm fare')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      status: 'success',
      results: transactions.length,
      data: { transactions }
    });
  } catch (err) {
    next(err);
  }
};
