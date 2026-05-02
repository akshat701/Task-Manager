import express from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { protect } from "../middleware/AuthMiddleware.js";
import { allowRoles } from "../middleware/Role.js";

const router = express.Router();


// 🔥 helper: project role check
const getUserProjectRole = (project, userId) => {
  if (project.owner.toString() === userId) {
    return "admin";
  }

  const member = project.members.find(
    (m) => m.user.toString() === userId
  );

  return member?.role || null;
};


// 🔥 helper: response mapping (backend → frontend)
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

    // 🔥 validation
    if (!project_id || !assignee_id) {
      return res.status(400).json({
        message: "Project and Assignee required",
      });
    }

    const proj = await Project.findById(project_id);

    if (!proj) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔥 RBAC CHECK (only admin can create)
    const role = getUserProjectRole(proj, req.user.id);

    if (role !== "admin") {
      return res.status(403).json({
        message: "Only admin can create task",
      });
    }

    // 🔥 check assignee belongs to project
    const isMember = proj.members.some(
      (m) => m.user.toString() === assignee_id
    );

    if (
      proj.owner.toString() !== assignee_id &&
      !isMember
    ) {
      return res.status(403).json({
        message: "Assignee not in project",
      });
    }

    // 🔥 fix status mismatch
    const finalStatus =
      status === "in_progress" ? "in-progress" : status;

    const task = await Task.create({
      title,
      status: finalStatus,
      priority,
      project: project_id,
      assignedTo: assignee_id,
      dueDate: due_date,
    });

    res.json(mapTask(task));

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
        { "members.user": req.user.id }, // ✅ FIX
      ],
    });

    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({
      project: { $in: projectIds },
    });

    res.json(tasks.map(mapTask));

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

    res.json(tasks.map(mapTask));

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

    // 🔥 member restriction
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

    const finalStatus =
      status === "in_progress" ? "in-progress" : status;

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        status: finalStatus,
        priority,
        assignedTo: assignee_id,
        dueDate: due_date,
      },
      { new: true }
    );

    res.json(mapTask(updated));

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