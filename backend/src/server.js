import "dotenv/config";
import app       from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Start background jobs — gracefully skip if scheduler not found
    try {
      const { startJobs } = await import("./jobs/jobScheduler.js");
      startJobs();
    } catch (e) {
      console.warn("⚠️  Background jobs not started:", e.message);
    }

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });

    let retryCount = 0;
    const maxRetries = 5;

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        retryCount += 1;
        if (retryCount > maxRetries) {
          console.error(`Port ${PORT} still busy after ${maxRetries} retries. Exiting.`);
          process.exit(1);
          return;
        }
        console.error(`Port ${PORT} is busy, retrying in 1s... (${retryCount}/${maxRetries})`);
        setTimeout(() => { server.close(); server.listen(PORT); }, 1000);
      } else {
        console.error("Server error:", err);
        process.exit(1);
      }
    });

    const shutdown = () => {
      console.log("Shutting down server...");
      server.close(() => { console.log("Server closed"); process.exit(0); });
    };

    process.on("SIGINT",  shutdown);
    process.on("SIGTERM", shutdown);

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

startServer();