import app from "./app.js";
import mongoose from "mongoose";

// ✅ ERROR HANDLERS (yahin daalna hai)
process.on("unhandledRejection", (err) => {
  console.error("UnhandledRejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("UncaughtException:", err);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  process.exit(0);
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log("Server running on port", PORT);
    });

  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
}

start();