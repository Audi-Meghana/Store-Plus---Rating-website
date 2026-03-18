import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

import authRoutes         from "./modules/auth/auth.routes.js";
import storeRoutes        from "./modules/stores/stores.routes.js";
import reviewRoutes       from "./modules/reviews/reviews.routes.js";
import dealRoutes         from "./modules/deals/deals.routes.js";
import notificationRoutes from "./modules/notifications/notifications.routes.js";
import userRoutes         from "./modules/users/users.routes.js";
import adminRoutes        from "./modules/admin/admin.routes.js";
import categoryRoutes     from "./modules/categories/categories.routes.js";

import errorHandler   from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

/* ================= SECURITY ================= */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:*", "https:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

/* ================= CORS FIX ================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://store-plus-rating-website-1.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

/* ================= STATIC ================= */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"), {
  maxAge: "7d",
  etag: true,
}));

/* ================= RATE LIMIT ================= */
app.use("/api", apiLimiter);

/* ================= ROUTES ================= */
app.use("/api/auth",          authRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/shops/:shopId/reviews",  reviewRoutes);
app.use("/api/stores/:shopId/reviews", reviewRoutes);
app.use("/api/reviews",                reviewRoutes);

app.use("/api/shops", storeRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);

/* ================= HEALTH CHECK ================= */
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

/* ================= ROOT (NO MORE 404 CONFUSION) ================= */
app.get("/", (req, res) => {
  res.send("API is running...");
});

/* ================= ERROR HANDLING ================= */
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);

app.use(errorHandler);

export default app;