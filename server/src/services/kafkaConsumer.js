import { kafkaConsumer, TOPICS, getKafkaStatus } from '../config/kafka.js';
import { logger } from '../utils/logger.js';
import { Transaction } from '../models/Transaction.js';
import { User } from '../models/User.js';
import { Driver } from '../models/Driver.js';

export const startKafkaConsumers = async () => {
  const status = getKafkaStatus();
  if (!status.connected) {
    logger.info('Kafka consumer not started (Kafka broker in fallback/standalone mode).');
    return;
  }

  try {
    await kafkaConsumer.connect();
    await kafkaConsumer.subscribe({
      topics: [
        TOPICS.BILLING_EVENTS,
        TOPICS.RIDE_STATUS,
        TOPICS.DRIVER_LOCATIONS
      ],
      fromBeginning: false
    });

    logger.kafka('Kafka Consumers subscribed and listening to topics.');

    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          
          if (topic === TOPICS.BILLING_EVENTS) {
            logger.kafka(`[CONSUMER] Processed Billing for Ride: ${payload.rideId}`);
            // Ensure transaction log exists in MongoDB
            if (payload.userId && payload.amount) {
              await Transaction.create({
                user: payload.userId,
                ride: payload.rideId,
                amount: payload.amount,
                type: payload.type || 'DEBIT',
                description: `Payment for ride #${payload.rideId}`,
                status: 'COMPLETED'
              });
            }
          } else if (topic === TOPICS.RIDE_STATUS) {
            logger.kafka(`[CONSUMER] Audit log for Ride ${payload.rideId}: Status -> ${payload.status}`);
          }
        } catch (err) {
          logger.error(`Error processing Kafka message on topic ${topic}: ${err.message}`);
        }
      }
    });
  } catch (error) {
    logger.warn(`Kafka Consumer failed to start: ${error.message}`);
  }
};
