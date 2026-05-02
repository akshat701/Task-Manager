// routes/project.routes.js
import express from "express";
import Project from "../models/Project.js";
import { protect } from "../middleware/AuthMiddleware.js";
import { allowRoles } from "../middleware/role.js";

const router = express.Router();

// create project (admin only)
router.post("/", protect, allowRoles("admin"), async (req, res) => {
  const project = await Project.create({
    ...req.body,
    owner: req.user.id,
    members: [],
  });
  res.json(project);
});

// get projects (only accessible ones)
router.get("/", protect, async (req, res) => {
  const projects = await Project.find({
    $or: [
      { owner: req.user.id },
      { members: req.user.id },
    ],
  });
  res.json(projects);
});

// add member
router.post("/add-member", protect, allowRoles("admin"), async (req, res) => {
  const { projectId, userId } = req.body;

  const project = await Project.findById(projectId);

  if (!project.members.includes(userId)) {
    project.members.push(userId);
    await project.save();
  }

  res.json(project);
});

export default router;