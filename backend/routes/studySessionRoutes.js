
const express = require("express");
const jwt = require("jsonwebtoken");
const StudySession = require("../models/StudySession");
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

// GET all completed study sessions for the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const sessions = await StudySession.find({ user: req.userId })
      .populate("subject", "name color")
      .sort({ startedAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error("Fetch study sessions error:", error.message);
    res.status(500).json({ message: "Failed to fetch study sessions" });
  }
});

// SAVE a completed study session
router.post("/", protect, async (req, res) => {
  try {
    const { subject, durationMinutes, startedAt, endedAt } = req.body;

    const duration = Number(durationMinutes);
    const start = new Date(startedAt);
    const end = new Date(endedAt);

    if (!Number.isFinite(duration) || duration < 1 || duration > 1440) {
      return res.status(400).json({
        message: "Study duration must be between 1 and 1440 minutes",
      });
    }

    if (
      !startedAt ||
      !endedAt ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return res.status(400).json({
        message: "Please provide valid study session start and end times",
      });
    }

    if (subject) {
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

    const session = await StudySession.create({
      user: req.userId,
      subject: subject || null,
      durationMinutes: duration,
      startedAt: start,
      endedAt: end,
    });

    const populatedSession = await session.populate("subject", "name color");

    res.status(201).json(populatedSession);
  } catch (error) {
    console.error("Save study session error:", error.message);
    res.status(500).json({ message: "Failed to save study session" });
  }
});

module.exports = router;
