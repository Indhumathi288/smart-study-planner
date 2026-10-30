
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const Subject = require("../models/Subject");

const router = express.Router();

// Authentication middleware
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// GET all tasks belonging to the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId })
      .populate("subject", "name color")
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    console.error("Fetch tasks error:", error.message);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// CREATE a study task or personal activity
router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      dueDate,
      priority,
      type = "Study",
    } = req.body;

    if (!title?.trim() || !dueDate) {
      return res.status(400).json({
        message: "Title and due date are required",
      });
    }

    if (!["Study", "Personal"].includes(type)) {
      return res.status(400).json({
        message: "Task type must be Study or Personal",
      });
    }

    if (!["Low", "Medium", "High"].includes(priority || "Medium")) {
      return res.status(400).json({
        message: "Invalid task priority",
      });
    }

    if (Number.isNaN(Date.parse(dueDate))) {
      return res.status(400).json({
        message: "Please provide a valid due date",
      });
    }

    if (type === "Study") {
      if (!subject || !mongoose.isValidObjectId(subject)) {
        return res.status(400).json({
          message: "Please select a valid subject for your study task",
        });
      }

      const subjectExists = await Subject.findOne({
        _id: subject,
        user: req.userId,
      });

      if (!subjectExists) {
        return res.status(400).json({
          message: "Please select a valid subject",
        });
      }
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      subject: type === "Study" ? subject : null,
      type,
      dueDate,
      priority: priority || "Medium",
      user: req.userId,
    });

    const populatedTask = await task.populate("subject", "name color");

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Create task error:", error.message);
    res.status(500).json({ message: "Failed to create task" });
  }
});

// UPDATE a task
router.put("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const allowedFields = [
      "title",
      "description",
      "subject",
      "dueDate",
      "priority",
      "completed",
      "type",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const existingTask = await Task.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedType = updates.type || existingTask.type || "Study";

    if (!["Study", "Personal"].includes(updatedType)) {
      return res.status(400).json({ message: "Invalid task type" });
    }

    if (
      updates.priority !== undefined &&
      !["Low", "Medium", "High"].includes(updates.priority)
    ) {
      return res.status(400).json({ message: "Invalid task priority" });
    }

    if (updates.title !== undefined && !updates.title.trim()) {
      return res.status(400).json({ message: "Task title cannot be empty" });
    }

    if (
      updates.dueDate !== undefined &&
      Number.isNaN(Date.parse(updates.dueDate))
    ) {
      return res.status(400).json({ message: "Invalid due date" });
    }

    if (updatedType === "Personal") {
      updates.subject = null;
    } else if (updatedType === "Study") {
      const subjectId =
        updates.subject !== undefined
          ? updates.subject
          : existingTask.subject?.toString();

      if (!subjectId || !mongoose.isValidObjectId(subjectId)) {
        return res.status(400).json({
          message: "Please select a subject for your study task",
        });
      }

      const subjectExists = await Subject.findOne({
        _id: subjectId,
        user: req.userId,
      });

      if (!subjectExists) {
        return res.status(400).json({
          message: "Please select a valid subject",
        });
      }

      updates.subject = subjectId;
    }

    if (updates.title !== undefined) {
      updates.title = updates.title.trim();
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updates,
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).populate("subject", "name color");

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error.message);
    res.status(500).json({ message: "Failed to update task" });
  }
});

// DELETE a task
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error.message);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

module.exports = router;
