import { Kafka, logLevel } from 'kafkajs';
import { logger } from '../utils/logger.js';

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const clientId = process.env.KAFKA_CLIENT_ID || 'oxima-service';

export const TOPICS = {
  DRIVER_LOCATIONS: 'driver-location-updates',
  RIDE_REQUESTS: 'ride-requests',
  RIDE_STATUS: 'ride-status-updates',
  BILLING_EVENTS: 'ride-billing-events',
  ANALYTICS: 'analytics-events'
};

const kafka = new Kafka({
  clientId,
  brokers,
  logLevel: logLevel.NOTHING,
  connectionTimeout: 1000,
  requestTimeout: 2000,
  retry: {
    initialRetryTime: 100,
    retries: 1
  }
});

export const kafkaProducer = kafka.producer({
  allowAutoTopicCreation: true
});

export const kafkaConsumer = kafka.consumer({
  groupId: 'oxima-core-group',
  allowAutoTopicCreation: true
});

let isKafkaConnected = false;

export const connectKafka = async () => {
  try {
    const admin = kafka.admin();
    await admin.connect();
    
    // Create topics if they do not exist
    const existingTopics = await admin.listTopics();
    const topicsToCreate = Object.values(TOPICS)
      .filter(topic => !existingTopics.includes(topic))
      .map(topic => ({
        topic,
        numPartitions: 2,
        replicationFactor: 1
      }));

    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        topics: topicsToCreate
      });
      logger.kafka(`Created Kafka topics: ${topicsToCreate.map(t => t.topic).join(', ')}`);
    }
    await admin.disconnect();

    await kafkaProducer.connect();
    logger.kafka(`Kafka Producer Connected to brokers: ${brokers.join(', ')}`);
    isKafkaConnected = true;
  } catch (err) {
    logger.warn(`Kafka broker at ${brokers.join(',')} not reachable (${err.message}). Using real-time in-memory event bus.`);
    isKafkaConnected = false;
  }
};

export const publishEvent = async (topic, key, payload) => {
  const message = {
    key: String(key || Date.now()),
    value: JSON.stringify({
      ...payload,
      timestamp: new Date().toISOString()
    })
  };

  if (isKafkaConnected) {
    try {
      await kafkaProducer.send({
        topic,
        messages: [message]
      });
      logger.kafka(`[EVENT PUBLISHED] -> Topic: ${topic} | Key: ${message.key}`);
    } catch (error) {
      logger.error(`Kafka Publish Error: ${error.message}`);
    }
  } else {
    logger.kafka(`[EVENT BUS STREAM] -> Topic: ${topic} | Key: ${message.key}`);
  }
};

export const getKafkaStatus = () => ({
  connected: isKafkaConnected,
  brokers,
  topics: Object.values(TOPICS)
});
