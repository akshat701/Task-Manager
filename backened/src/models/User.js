// models/User.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "member"],
    default: "member",
  },
});

export default mongoose.model("User", schema);