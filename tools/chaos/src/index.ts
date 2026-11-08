const PACKAGE_NAME = '@conversations-eda/chaos';

const config = {
  KAFKA_BROKERS: process.env.KAFKA_BROKERS,
  KAFKA_TOPIC: process.env.KAFKA_TOPIC,
  DATABASE_URL: process.env.DATABASE_URL,
} as const;

console.log(`[${PACKAGE_NAME}] started with config:`, config);
