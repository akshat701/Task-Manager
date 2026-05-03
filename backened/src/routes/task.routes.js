import express from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { protect } from "../middleware/AuthMiddleware.js";
import { allowRoles } from "../middleware/Role.js";

const router = express.Router();

// ================================
// 🔥 SAFE STRING HELPER
// ================================
const toStr = (val) => (val ? String(val) : "");

// ================================
// 🔥 helper: project role check
// ================================
const getUserProjectRole = (project, userId) => {
  if (toStr(project.owner) === toStr(userId)) {
    return "admin";
  }

  const member = project.members.find(
    (m) => m?.user && toStr(m.user) === toStr(userId)
  );

  return member?.role || null;
};

// ================================
// 🔥 helper: response mapping
// ================================
const mapTask = (task) => ({
  ...task.toObject(),
  id: task._id,
  project_id: task.project?._id || task.project,
  assignee_id: task.assignedTo?._id || task.assignedTo,
  assignedTo: task.assignedTo, // 🔥 important for name
  due_date: task.dueDate,
  project: task.project,
});

// ================================
// 🔥 CREATE TASK (ADMIN ONLY)
// ================================
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

    if (!project_id || !assignee_id) {
      return res.status(400).json({
        message: "Project and Assignee required",
      });
    }

    const proj = await Project.findById(project_id);

    if (!proj) {
      return res.status(404).json({ message: "Project not found" });
    }

    const role = getUserProjectRole(proj, req.user.id);

    if (role !== "admin") {
      return res.status(403).json({
        message: "Only admin can create task",
      });
    }

    const isMember = proj.members.some(
      (m) => m?.user && toStr(m.user) === toStr(assignee_id)
    );

    if (
      toStr(proj.owner) !== toStr(assignee_id) &&
      !isMember
    ) {
      return res.status(403).json({
        message: "Assignee not in project",
      });
    }

    const task = await Task.create({
      title,
      status,
      priority,
      project: project_id,
      assignedTo: assignee_id,
      dueDate: due_date,
    });

    const populated = await Task.findById(task._id)
      .populate("project", "name")
      .populate("assignedTo", "name email");

    res.json(mapTask(populated));

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================================
// 🔥 GET TASKS (RBAC + POPULATE FIX)
// ================================
router.get("/", protect, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "admin") {
      tasks = await Task.find()
        .populate("project", "name")
        .populate("assignedTo", "name email");
    } else {
      tasks = await Task.find({
        assignedTo: req.user.id,
      })
        .populate("project", "name")
        .populate("assignedTo", "name email");
    }

    res.json(tasks.map(mapTask));

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================================
// 🔥 MY TASKS
// ================================
router.get("/my", protect, async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.id,
    })
      .populate("project", "name")
      .populate("assignedTo", "name email");

    res.json(tasks.map(mapTask));

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================================
// 🔥 UPDATE TASK
// ================================
router.patch("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isOwner =
      toStr(task.assignedTo) === toStr(req.user.id);

    const isAdmin =
      req.user.role === "admin" ||
      toStr(project.owner) === toStr(req.user.id) ||
      project.members.some(
        (m) =>
          m?.user &&
          toStr(m.user) === toStr(req.user.id) &&
          m.role === "admin"
      );

    if (!isOwner && !isAdmin) {
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
        assignedTo: assignee_id || task.assignedTo,
        dueDate: due_date,
      },
      { new: true }
    )
      .populate("project", "name")
      .populate("assignedTo", "name email");

    res.json(mapTask(updated));

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================================
// 🔥 DELETE TASK
// ================================
router.delete("/:id", protect, allowRoles("admin"), async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;