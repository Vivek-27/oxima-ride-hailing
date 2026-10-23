import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Driver } from '../models/Driver.js';
import { Ride } from '../models/Ride.js';
import { Transaction } from '../models/Transaction.js';
import { connectDB } from '../config/db.js';
import { connectRedis, redisClient } from '../config/redis.js';
import { geoService } from '../services/geoService.js';
import { logger } from './logger.js';

dotenv.config();

const seed = async () => {
  try {
    await connectDB();
    await connectRedis();

    logger.info('Clearing data and seeding Real Hyderabad Fleet across all 6 vehicle categories...');
    await User.deleteMany({});
    await Driver.deleteMany({});
    await Ride.deleteMany({});
    await Transaction.deleteMany({});

    if (redisClient.status === 'ready') {
      await redisClient.flushall();
      logger.redis('Redis database flushed.');
    }

    // 1. Admin
    await User.create({
      name: 'System Admin',
      email: 'admin@oxima.com',
      password: 'adminpassword123',
      phone: '+91 98765 43210',
      role: 'admin'
    });

    // 2. Rider
    const rider = await User.create({
      name: 'Sneha Reddy',
      email: 'rider@oxima.com',
      password: 'password123',
      phone: '+91 98480 12345',
      role: 'rider',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    });

    // 3. Hyderabad Drivers distributed across IT Corridor, Banjara Hills, Airport, Secunderabad (Within 20 km)
    const hydDrivers = [
      {
        name: 'K. Shiva Kumar (Moto)',
        email: 'shiva.moto@oxima.com',
        password: 'password123',
        phone: '+91 98481 00001',
        upiId: 'shiva@ybl',
        vehicle: {
          make: 'Hero',
          model: 'Splendor Plus',
          year: 2024,
          color: 'Black/Silver',
          licensePlate: 'TS-09-EA-1122',
          rcNumber: 'RC-TS-MOTO-101',
          type: 'Moto'
        },
        coordinates: [78.3780, 17.4490] // Cyber Towers, Hitec City
      },
      {
        name: 'V. Venkatesh (Auto)',
        email: 'venkatesh.auto@oxima.com',
        password: 'password123',
        phone: '+91 98481 00002',
        upiId: 'venkatesh@paytm',
        vehicle: {
          make: 'Bajaj',
          model: 'Compact RE Auto',
          year: 2024,
          color: 'Yellow/Green',
          licensePlate: 'TS-09-UA-3344',
          rcNumber: 'RC-TS-AUTO-202',
          type: 'Auto'
        },
        coordinates: [78.3850, 17.4380] // Mindspace Madhapur
      },
      {
        name: 'Mohammed Rizwan (Mini)',
        email: 'rizwan.mini@oxima.com',
        password: 'password123',
        phone: '+91 98481 00003',
        upiId: 'rizwan@okhdfcbank',
        vehicle: {
          make: 'Maruti Suzuki',
          model: 'WagonR 1.2',
          year: 2023,
          color: 'Silky Silver',
          licensePlate: 'TS-07-HB-5566',
          rcNumber: 'RC-TS-MINI-303',
          type: 'Mini'
        },
        coordinates: [78.3520, 17.4180] // Financial District, Gachibowli
      },
      {
        name: 'P. Srinivas Rao (Sedan)',
        email: 'srinivas.sedan@oxima.com',
        password: 'password123',
        phone: '+91 98481 00004',
        upiId: 'srinivas@icici',
        vehicle: {
          make: 'Hyundai',
          model: 'Verna SX',
          year: 2024,
          color: 'Polar White',
          licensePlate: 'TS-09-FB-7788',
          rcNumber: 'RC-TS-SEDAN-404',
          type: 'Sedan'
        },
        coordinates: [78.4116, 17.4285] // Jubilee Hills Check Post
      },
      {
        name: 'M. Anand (SUV)',
        email: 'anand.suv@oxima.com',
        password: 'password123',
        phone: '+91 98481 00005',
        upiId: 'anand@axl',
        vehicle: {
          make: 'Toyota',
          model: 'Innova Crysta 2.4 VX',
          year: 2023,
          color: 'Super White',
          licensePlate: 'TS-08-ZA-9900',
          rcNumber: 'RC-TS-SUV-505',
          type: 'SUV'
        },
        coordinates: [78.3619, 17.4578] // Sarath City Capital Mall, Kondapur
      },
      {
        name: 'K. Naresh (Electric)',
        email: 'naresh.ev@oxima.com',
        password: 'password123',
        phone: '+91 98481 00006',
        upiId: 'naresh@paytm',
        vehicle: {
          make: 'Tata',
          model: 'Nexon EV Empowered',
          year: 2024,
          color: 'Teal Blue',
          licensePlate: 'TS-09-EV-1010',
          rcNumber: 'RC-TS-EV-606',
          type: 'Electric'
        },
        coordinates: [78.3725, 17.4385] // IKEA Hyderabad, Raidurg
      }
    ];

    for (const d of hydDrivers) {
      const user = await User.create({
        name: d.name,
        email: d.email,
        password: d.password,
        phone: d.phone,
        role: 'driver',
        rating: 4.9
      });

      const driver = await Driver.create({
        user: user._id,
        vehicle: d.vehicle,
        upiId: d.upiId,
        status: 'ONLINE',
        currentLocation: {
          type: 'Point',
          coordinates: d.coordinates
        },
        todayEarnings: Math.floor(Math.random() * 500) + 300,
        totalEarnings: Math.floor(Math.random() * 6000) + 3000,
        totalTrips: Math.floor(Math.random() * 40) + 15,
        acceptanceRate: 99,
        rating: 4.9
      });

      await geoService.updateDriverLocation(
        driver._id,
        d.coordinates[0],
        d.coordinates[1],
        60,
        'ONLINE'
      );
    }

    // Seed Sample Past Completed Ride for History
    const pastRide = await Ride.create({
      rider: rider._id,
      pickup: {
        address: 'Cyber Towers, Hitec City',
        location: { type: 'Point', coordinates: [78.3772, 17.4504] }
      },
      destination: {
        address: 'Inorbit Mall, Madhapur',
        location: { type: 'Point', coordinates: [78.3867, 17.4342] }
      },
      vehicleType: 'Mini',
      distanceKm: 3.8,
      durationMins: 12,
      fare: {
        baseFare: 50,
        distanceFare: 53.2,
        timeFare: 24,
        surgeMultiplier: 1.0,
        totalFare: 127.2,
        currency: 'INR'
      },
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      status: 'COMPLETED',
      timeline: {
        requestedAt: new Date(Date.now() - 3600000 * 2),
        acceptedAt: new Date(Date.now() - 3600000 * 2 + 60000),
        startedAt: new Date(Date.now() - 3600000 * 2 + 180000),
        completedAt: new Date(Date.now() - 3600000 * 2 + 900000)
      },
      rating: {
        riderScore: 5,
        riderReview: 'Very smooth ride through Madhapur!'
      }
    });

    logger.success('✅ Hyderabad Fleet with real landmarks, 6 vehicle categories, and ride history seeded!');
    process.exit(0);
  } catch (error) {
    logger.error(`Seed error: ${error.message}`);
    process.exit(1);
  }
};

seed();
