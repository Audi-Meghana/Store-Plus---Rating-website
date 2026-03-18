import { createClient } from "redis";
import "dotenv/config";

let redisClient = null;

export const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.log("Redis URL not set - skipping Redis connection");
    return null;
  }
  try {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on("error", (err) => console.error("Redis error:", err));
    await redisClient.connect();
    console.log("Redis connected successfully");
    return redisClient;
  } catch (err) {
    console.error("Redis connection failed:", err.message);
    return null;
  }
};

export const getRedis = () => redisClient;
export default redisClient;