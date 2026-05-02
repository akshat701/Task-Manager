// models/Project.js
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: String,
    description: String,
    owner: String,
    members: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Project", schema);