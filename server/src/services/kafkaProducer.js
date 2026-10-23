import { publishEvent, TOPICS } from '../config/kafka.js';

export const kafkaProducerService = {
  /**
   * Broadcast driver location coordinates to Kafka
   */
  async streamDriverLocation(driverId, latitude, longitude, heading, speed) {
    await publishEvent(TOPICS.DRIVER_LOCATIONS, driverId, {
      driverId,
      latitude,
      longitude,
      heading,
      speed,
      timestamp: Date.now()
    });
  },

  /**
   * Stream ride creation request
   */
  async streamRideRequest(ride) {
    await publishEvent(TOPICS.RIDE_REQUESTS, ride._id, {
      rideId: ride._id,
      riderId: ride.rider._id || ride.rider,
      pickup: ride.pickup,
      destination: ride.destination,
      vehicleType: ride.vehicleType,
      totalFare: ride.fare?.totalFare,
      distanceKm: ride.distanceKm,
      status: ride.status
    });
  },

  /**
   * Stream ride status changes (ACCEPTED, ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED)
   */
  async streamRideStatus(rideId, status, meta = {}) {
    await publishEvent(TOPICS.RIDE_STATUS, rideId, {
      rideId,
      status,
      ...meta,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Stream billing and invoice event
   */
  async streamBillingEvent(rideId, transactionData) {
    await publishEvent(TOPICS.BILLING_EVENTS, rideId, {
      rideId,
      ...transactionData,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Stream analytics event for heatmap / metrics
   */
  async streamAnalytics(eventType, data) {
    await publishEvent(TOPICS.ANALYTICS, eventType, {
      eventType,
      data,
      timestamp: new Date().toISOString()
    });
  }
};
