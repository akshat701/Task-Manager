// routes/task.routes.js
import express from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { protect } from "../middleware/AuthMiddleware.js";
import { allowRoles } from "../middleware/role.js";

const router = express.Router();

// create (admin only)
router.post("/", protect, allowRoles("admin"), async (req, res) => {
  const task = await Task.create(req.body);
  res.json(task);
});

// get tasks (only project members)
router.get("/", protect, async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// update task
router.patch("/:id", protect, async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (
    req.user.role === "member" &&
    task.assignee_id !== req.user.id
  ) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const updated = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
});

// delete (admin only)
router.delete("/:id", protect, allowRoles("admin"), async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;