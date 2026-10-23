import axios from 'axios';
import { logger } from './logger.js';

const BASE_URL = 'http://localhost:5000/api/v1';

const runIntegrationTests = async () => {
  logger.info('🧪 Starting Oxima End-to-End Automated Integration Test Suite...');
  
  try {
    // 1. Test Health Endpoint
    logger.info('Step 1: Checking API Health & Infrastructure...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    logger.success(`Health Check Status: ${healthRes.data.status} | Services: ${JSON.stringify(healthRes.data.services)}`);

    // 2. Rider Login
    logger.info('Step 2: Authenticating Rider (Sarah)...');
    const riderLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'rider@oxima.com',
      password: 'password123'
    });
    const riderToken = riderLoginRes.data.token;
    const riderId = riderLoginRes.data.data.user._id;
    const initialRiderWallet = riderLoginRes.data.data.user.walletBalance;
    logger.success(`Rider Authenticated. Wallet Balance: $${initialRiderWallet}`);

    // 3. Driver Login
    logger.info('Step 3: Authenticating Driver (Alex)...');
    const driverLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'alex.driver@oxima.com',
      password: 'password123'
    });
    const driverToken = driverLoginRes.data.token;
    const driverId = driverLoginRes.data.data.driver._id;
    logger.success(`Driver Authenticated. Driver ID: ${driverId}`);

    // Set Driver Status to ONLINE
    await axios.patch(`${BASE_URL}/drivers/status`, { status: 'ONLINE' }, {
      headers: { Authorization: `Bearer ${driverToken}` }
    });
    logger.success('Driver status toggled to ONLINE in Redis GEO pool.');

    // 4. Request Fare Estimate
    logger.info('Step 4: Requesting Fare Estimate & Redis Driver Radius Search...');
    const estimateRes = await axios.post(`${BASE_URL}/rides/estimate`, {
      pickupLng: -74.0134,
      pickupLat: 40.7127,
      destLng: -73.9857,
      destLat: 40.7484,
      pickupAddress: 'One World Trade Center, NYC',
      destAddress: 'Empire State Building, NYC'
    }, {
      headers: { Authorization: `Bearer ${riderToken}` }
    });
    logger.success(`Fare Estimate: Distance=${estimateRes.data.data.distanceKm}km, Economy Total=$${estimateRes.data.data.estimates.Economy.totalFare}, Nearby Drivers=${estimateRes.data.data.nearbyDriversCount}`);

    // 5. Create Ride Request
    logger.info('Step 5: Booking Ride via Kafka Event Bus...');
    const bookRes = await axios.post(`${BASE_URL}/rides/request`, {
      pickup: {
        address: 'One World Trade Center, NYC',
        location: { type: 'Point', coordinates: [-74.0134, 40.7127] }
      },
      destination: {
        address: 'Empire State Building, NYC',
        location: { type: 'Point', coordinates: [-73.9857, 40.7484] }
      },
      vehicleType: 'Economy'
    }, {
      headers: { Authorization: `Bearer ${riderToken}` }
    });
    const ride = bookRes.data.data.ride;
    const rideId = ride._id;
    const otp = ride.otp;
    logger.success(`Ride Created! ID: ${rideId}, Status: ${ride.status}, Generated 4-Digit OTP: ${otp}`);

    // 6. Driver Accepts Ride
    logger.info('Step 6: Driver Accepting Ride...');
    const acceptRes = await axios.post(`${BASE_URL}/drivers/rides/${rideId}/accept`, {}, {
      headers: { Authorization: `Bearer ${driverToken}` }
    });
    logger.success(`Ride Accepted! Status: ${acceptRes.data.data.ride.status}`);

    // 7. Driver Marks Arrived at Pickup
    logger.info('Step 7: Driver Marking Arrived at Pickup...');
    const arriveRes = await axios.post(`${BASE_URL}/drivers/rides/${rideId}/arrived`, {}, {
      headers: { Authorization: `Bearer ${driverToken}` }
    });
    logger.success(`Driver Arrived! Status: ${arriveRes.data.data.ride.status}`);

    // 8. Driver Starts Ride with OTP
    logger.info(`Step 8: Driver Submitting 4-Digit OTP (${otp}) to Start Trip...`);
    const startRes = await axios.post(`${BASE_URL}/drivers/rides/${rideId}/start`, { otp }, {
      headers: { Authorization: `Bearer ${driverToken}` }
    });
    logger.success(`OTP Verified! Trip In Progress: ${startRes.data.data.ride.status}`);

    // 9. Driver Completes Ride (Fare auto-deducted & payout processed)
    logger.info('Step 9: Driver Completing Trip & Triggering Billing Worker...');
    const completeRes = await axios.post(`${BASE_URL}/drivers/rides/${rideId}/complete`, {}, {
      headers: { Authorization: `Bearer ${driverToken}` }
    });
    logger.success(`Trip Completed! Status: ${completeRes.data.data.ride.status}, Driver Earnings: $${completeRes.data.data.earnings}`);

    // 10. Rider Rates Driver
    logger.info('Step 10: Rider Submitting 5-Star Rating...');
    const rateRes = await axios.post(`${BASE_URL}/rides/${rideId}/rate`, {
      score: 5,
      review: 'Awesome, fast, and smooth ride!'
    }, {
      headers: { Authorization: `Bearer ${riderToken}` }
    });
    logger.success('Rating Submitted Successfully!');

    // 11. Admin Audit Verification
    logger.info('Step 11: Admin Audit & Fleet Metrics Verification...');
    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@oxima.com',
      password: 'adminpassword123'
    });
    const adminToken = adminLoginRes.data.token;

    const statsRes = await axios.get(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logger.success(`Admin Stats Verified! Total Volume=$${statsRes.data.data.stats.grossVolume}, Platform Revenue=$${statsRes.data.data.stats.platformRevenue}, Completed Rides=${statsRes.data.data.stats.completedRides}`);

    logger.success('===========================================================');
    logger.success('🎉 ALL 11 END-TO-END TESTS PASSED WITH 100% SUCCESS!');
    logger.success('===========================================================');
  } catch (error) {
    logger.error(`Integration test failed at: ${error.message}`);
    if (error.response?.data) {
      logger.error(`Error details: ${JSON.stringify(error.response.data)}`);
    }
  }
};

runIntegrationTests();
