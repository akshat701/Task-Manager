import express from "express";
import Project from "../models/Project.js";
import { protect } from "../middleware/AuthMiddleware.js";
import { allowRoles } from "../middleware/Role.js";

const router = express.Router();

// CREATE PROJECT
router.post("/", protect, allowRoles("admin"), async (req, res) => {
  try {
    const { name, description, deadline, members, created_at, owner_id } =
      req.body;
const formattedMembers = (members || []).map((id) => ({
  user: id,
  role: "member",
}));
    const project = await Project.create({
      name,
      description,
      deadline,
      members: formattedMembers,
      created_at: created_at || new Date(),

      // 🔥 IMPORTANT: always use logged-in user
      owner: req.user.id,
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET PROJECTS
router.get("/", protect, async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user.id }, { "members.user": req.user.id }],
  }).populate("members", "name email");

  res.json(projects);
});

// ADD MEMBER
router.post("/add-member", protect, allowRoles("admin"), async (req, res) => {
  try {
    const { projectId, userId, role } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // already exists check
    const exists = project.members.find((m) => m.user.toString() === userId);

    if (exists) {
      return res.status(400).json({ message: "User already added" });
    }

    project.members.push({
      user: userId,
      role: role || "member",
    });

    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
