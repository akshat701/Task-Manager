import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dashboardRoutes from "./routes/dashboard.routes.js";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import projectRoutes from "./routes/project.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

// ✅ CORS (clean & stable)
const allowedOrigins = [
  "http://localhost:5173",
  "https://task-manager-6jn1pro30-akshat-goyals-projects-df432565.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (postman etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

// ✅ health check (Railway friendly)
app.get("/", (req, res) => {
  res.status(200).send("API running 🚀");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ✅ routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;