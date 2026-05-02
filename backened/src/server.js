import app from "./app.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log("Server running on port", PORT);
    });
  } catch (err) {
    console.error("DB error:", err);
    process.exit(1);
  }
};

start();