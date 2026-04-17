import dotenv from "dotenv";
dotenv.config();

const config = {
  apiUrl: process.env.API_URL,
  kreteaAuthSecret: process.env.KRETEA_AUTH_SECRET,
  scheduleIntervalMs: parseInt(process.env.SCHEDULE_INTERVAL_MS),
  aiModelUrl: process.env.AI_MODEL_URL,
  aiModelName: process.env.AI_MODEL_NAME,
  aiApiKey: process.env.AI_API_KEY,
};

export default config;
