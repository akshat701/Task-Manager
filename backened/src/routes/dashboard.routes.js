import express from "express";
import Task from "../models/Task.js";
import { protect } from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.get("/stats", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalTasks = await Task.countDocuments({
      assignedTo: userId,
    });

    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "done",
    });

    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: "done" },
    });

    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: "done" },
      dueDate: { $lt: new Date() },
    });

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;