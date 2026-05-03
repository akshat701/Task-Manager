import express from "express";
import Project from "../models/Project.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { protect } from "../middleware/AuthMiddleware.js";
import { allowRoles } from "../middleware/Role.js";

const router = express.Router();

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

router.patch(
  "/members/remove",
  protect,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const { projectId, userId } = req.body;

      if (!projectId || !userId) {
        return res.status(400).json({ message: "Missing data" });
      }

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      project.members = project.members.filter(
        (m) => m?.user && m.user.toString() !== userId,
      );

      await project.save();

      res.json(project);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

router.patch("/:id", protect, async (req, res) => {
  try {
    const { name, description, deadline } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, deadline },
      { new: true },
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { "members.user": req.user.id }],
    }).populate("members.user", "name email");

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "members.user",
      "name email",
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/add-member", protect, allowRoles("admin"), async (req, res) => {
  try {
    const { projectId, userId, role } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const exists = project.members.find(
      (m) => m?.user && m.user.toString() === userId,
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

router.patch("/update-role", protect, allowRoles("admin"), async (req, res) => {
  try {
    const { projectId, userId, role } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const member = project.members.find(
      (m) => m?.user && m.user.toString() === userId,
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

router.post(
  "/add-new-member",
  protect,
  allowRoles("admin"),
  async (req, res) => {
    try {
      const { projectId, name, email, password, role } = req.body;

      let user = await User.findOne({ email });

      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        debugger;
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
        (m) => m?.user && m.user.toString() === user._id.toString(),
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
  },
);

export default router;
