import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import projectRoutes from "./routes/project.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

// ✅ FIX 1: Proper CORS config (methods + headers add kiye)
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://task-manager-frontend.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

// ✅ FIX 2: Preflight request handle (VERY IMPORTANT)
app.options("*", cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);

export default app;