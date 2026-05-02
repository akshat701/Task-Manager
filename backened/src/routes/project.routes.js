import express from "express";
import Project from "../models/Project.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs"; // 🔥 IMPORTANT
import { protect } from "../middleware/AuthMiddleware.js";
import { allowRoles } from "../middleware/Role.js";

const router = express.Router();


// ================================
// 🔥 CREATE PROJECT
// ================================
router.post("/", protect, allowRoles("admin"), async (req, res) => {
  try {
    const { name, description, deadline, members } = req.body;

    const formattedMembers = (members || []).map((id) => ({
      user: id,
      role: "member",
    }));

    const project = await Project.create({
      name,
      description,
      deadline,
      members: formattedMembers,
      owner: req.user.id,
    });

    res.json(project);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================================
// 🔥 GET PROJECTS
// ================================
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { "members.user": req.user.id },
      ],
    }).populate("members.user", "name email");

    res.json(projects);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================================
// 🔥 GET SINGLE PROJECT
// ================================
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================================
// 🔥 ADD EXISTING USER
// ================================
router.post("/add-member", protect, allowRoles("admin"), async (req, res) => {
  try {
    const { projectId, userId, role } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const exists = project.members.find(
      (m) => m?.user && m.user.toString() === userId
    );

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


// ================================
// 🔥 UPDATE ROLE
// ================================
router.patch("/update-role", protect, allowRoles("admin"), async (req, res) => {
  try {
    const { projectId, userId, role } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const member = project.members.find(
      (m) => m?.user && m.user.toString() === userId
    );

    if (!member) {
      return res.status(404).json({ message: "User not found" });
    }

    member.role = role;
    await project.save();

    res.json(project);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================================
// 🔥 ADD NEW USER + ADD TO PROJECT
// ================================
router.post("/add-new-member", protect, allowRoles("admin"), async (req, res) => {
  try {
    const { projectId, name, email, password, role } = req.body;

    let user = await User.findOne({ email });

    // 🔥 CREATE USER IF NOT EXISTS
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10); // ✅ FIX
      debugger
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "member",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const exists = project.members.find(
      (m) => m?.user && m.user.toString() === user._id.toString()
    );

    if (!exists) {
      project.members.push({
        user: user._id,
        role: role || "member",
      });

      await project.save();
    }

    res.json({
      message: "User added successfully",
      user,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;