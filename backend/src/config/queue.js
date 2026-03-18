import Bull from "bull";
import "dotenv/config";

const redisConfig = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : { host: "127.0.0.1", port: 6379 };

export const reviewQueue = process.env.REDIS_URL
  ? new Bull("review-queue", process.env.REDIS_URL)
  : null;

export const notifQueue = process.env.REDIS_URL
  ? new Bull("notif-queue", process.env.REDIS_URL)
  : null;

export default { reviewQueue, notifQueue };