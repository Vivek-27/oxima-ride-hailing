import mongoose from 'mongoose';

const locationSubSchema = new mongoose.Schema({
  address: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
}, { _id: false });

const rideSchema = new mongoose.Schema({
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    default: null
  },
  pickup: {
    type: locationSubSchema,
    required: true
  },
  destination: {
    type: locationSubSchema,
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['Moto', 'Auto', 'Mini', 'Sedan', 'SUV', 'Electric'],
    default: 'Mini'
  },
  status: {
    type: String,
    enum: [
      'REQUESTED',
      'SEARCHING',
      'ACCEPTED',
      'ARRIVING',
      'ARRIVED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED'
    ],
    default: 'REQUESTED'
  },
  otp: {
    type: String,
    default: () => Math.floor(1000 + Math.random() * 9000).toString()
  },
  distanceKm: {
    type: Number,
    required: true
  },
  durationMins: {
    type: Number,
    required: true
  },
  routePolyline: {
    type: [[Number]],
    default: []
  },
  fare: {
    baseFare: { type: Number, required: true },
    distanceFare: { type: Number, required: true },
    timeFare: { type: Number, default: 0 },
    surgeMultiplier: { type: Number, default: 1.0 },
    discount: { type: Number, default: 0 },
    totalFare: { type: Number, required: true },
    currency: { type: String, default: 'INR' }
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'UPI'],
    default: 'CASH'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING'
  },
  timeline: {
    requestedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    arrivedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date }
  },
  cancelledBy: {
    type: String,
    enum: ['rider', 'driver', 'system', null],
    default: null
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  rating: {
    riderScore: { type: Number, min: 1, max: 5 },
    driverScore: { type: Number, min: 1, max: 5 },
    riderReview: { type: String, default: '' },
    driverReview: { type: String, default: '' }
  }
}, {
  timestamps: true
});

rideSchema.index({ 'pickup.location': '2dsphere' });
rideSchema.index({ 'destination.location': '2dsphere' });
rideSchema.index({ rider: 1, status: 1 });
rideSchema.index({ driver: 1, status: 1 });

export const Ride = mongoose.model('Ride', rideSchema);
