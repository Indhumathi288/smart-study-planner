
const express = require("express");
const Subject = require("../models/Subject");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Verify the logged-in user
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
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Get the logged-in user's subjects
router.get("/", protect, async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
});

// Create a subject
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    const subject = await Subject.create({
      name: name.trim(),
      description,
      color,
      user: req.userId,
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Failed to create subject" });
  }
});

// Update a subject
router.put("/:id", protect, async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: "Failed to update subject" });
  }
});

// Delete a subject
router.delete("/:id", protect, async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete subject" });
  }
});

module.exports = router;
