import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  vehicle: {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, default: 2023 },
    color: { type: String, default: 'White' },
    licensePlate: { type: String, required: true, uppercase: true, trim: true },
    rcNumber: { type: String, required: true, uppercase: true, trim: true, unique: true },
    type: {
      type: String,
      enum: ['Moto', 'Auto', 'Mini', 'Sedan', 'SUV', 'Electric'],
      default: 'Mini'
    }
  },
  upiId: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['OFFLINE', 'ONLINE', 'BUSY', 'ON_TRIP'],
    default: 'OFFLINE'
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [77.2090, 28.6139] // Default New Delhi, India
    }
  },
  currentHeading: {
    type: Number,
    default: 0
  },
  documents: {
    licenseNumber: { type: String, default: 'DL-IND-889922' },
    isVerified: { type: Boolean, default: true }
  },
  activeRide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    default: null
  },
  todayEarnings: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalTrips: {
    type: Number,
    default: 0
  },
  acceptanceRate: {
    type: Number,
    default: 98
  },
  rating: {
    type: Number,
    default: 4.9,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

driverSchema.index({ currentLocation: '2dsphere' });
driverSchema.index({ status: 1 });

export const Driver = mongoose.model('Driver', driverSchema);
