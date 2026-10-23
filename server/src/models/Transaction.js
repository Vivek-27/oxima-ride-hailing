import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['DEBIT', 'CREDIT', 'PAYOUT', 'REFUND'],
    required: true
  },
  status: {
    type: String,
    enum: ['COMPLETED', 'PENDING', 'FAILED'],
    default: 'COMPLETED'
  },
  description: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'WALLET'
  }
}, {
  timestamps: true
});

export const Transaction = mongoose.model('Transaction', transactionSchema);
