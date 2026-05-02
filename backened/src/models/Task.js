// models/Task.js
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    title: String,
    status: String,
    priority: String,
    project_id: String,
    assignee_id: String,
    due_date: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Task", schema);