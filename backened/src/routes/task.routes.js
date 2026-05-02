import express from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { protect } from "../middleware/AuthMiddleware.js";
import { allowRoles } from "../middleware/Role.js";

const router = express.Router();


// 🔥 helper (VERY IMPORTANT)
const mapTask = (task) => ({
  ...task.toObject(),
  id: task._id,
  project_id: task.project,
  assignee_id: task.assignedTo,
  due_date: task.dueDate,
});


// 🔥 CREATE TASK (ADMIN ONLY)
router.post("/", protect, allowRoles("admin"), async (req, res) => {
  try {
    const {
      title,
      status,
      priority,
      project_id,
      assignee_id,
      due_date,
    } = req.body;

    const proj = await Project.findById(project_id);

    if (!proj) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (
      proj.owner.toString() !== req.user.id &&
      !proj.members.includes(assignee_id)
    ) {
      return res.status(403).json({ message: "User not in project" });
    }

    const task = await Task.create({
      title,
      status,
      priority,
      project: project_id,        // ✅ mapping
      assignedTo: assignee_id,    // ✅ mapping
      dueDate: due_date,          // ✅ mapping
    });

    res.json(mapTask(task)); // ✅ response mapping
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 🔥 GET ALL TASKS
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { members: req.user.id },
      ],
    });

    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({
      project: { $in: projectIds },
    });

    res.json(tasks.map(mapTask)); // ✅ mapping applied
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 🔥 MY TASKS (Dashboard)
router.get("/my", protect, async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.id,
    });

    res.json(tasks.map(mapTask)); // ✅ mapping
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 🔥 UPDATE TASK
router.patch("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (
      req.user.role === "member" &&
      task.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const {
      title,
      status,
      priority,
      assignee_id,
      due_date,
    } = req.body;

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        status,
        priority,
        assignedTo: assignee_id, // ✅ mapping
        dueDate: due_date,       // ✅ mapping
      },
      { new: true }
    );

    res.json(mapTask(updated)); // ✅ mapping
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 🔥 DELETE TASK
router.delete("/:id", protect, allowRoles("admin"), async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;