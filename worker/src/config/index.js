import dotenv from 'dotenv';
dotenv.config();

const config = {
  apiUrl: process.env.API_URL || 'http://localhost:8080/v1/trends/ingest',
  kreteaAuthSecret: process.env.KRETEA_AUTH_SECRET || 'default_secret_dev',
  scheduleIntervalMs: parseInt(process.env.SCHEDULE_INTERVAL_MS) || 24 * 60 * 60 * 1000
};

export default config;
