import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import projectRoutes from "./routes/project.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);

export default app;