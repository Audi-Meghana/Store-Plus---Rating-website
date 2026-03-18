import "dotenv/config";

const required = [
  "PORT",
  "MONGO_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "CLIENT_URL",
];

required.forEach((key) => {
  if (!process.env[key]) {
    console.error("Missing required env var: " + key);
    process.exit(1);
  }
});

export default {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  clientUrl: process.env.CLIENT_URL,
  nodeEnv: process.env.NODE_ENV || "development",
};