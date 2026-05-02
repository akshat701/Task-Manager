import app from "./app.js";
import mongoose from "mongoose";

process.on("unhandledRejection", (err) => {
  console.error("UnhandledRejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("UncaughtException:", err);
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("Server running on port", PORT);
    });

    // graceful shutdown (no crash)
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Closing server...");
      server.close(() => {
        console.log("Server closed");
      });
    });

  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
}

start();