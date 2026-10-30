
const express = require("express");
const jwt = require("jsonwebtoken");
const Task = require("../models/Task");
const Subject = require("../models/Subject");

const router = express.Router();

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
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

router.post("/generate", protect, async (req, res) => {
  try {
    const hours = Number(req.body.hours);

    if (!Number.isFinite(hours) || hours <= 0 || hours > 16) {
      return res.status(400).json({
        message: "Choose between 0.5 and 16 study hours.",
      });
    }

    const [subjects, tasks] = await Promise.all([
      Subject.find({ user: req.userId }),
      Task.find({
        user: req.userId,
        type: "Study",
        completed: false,
      }).populate("subject", "name"),
    ]);

    if (subjects.length === 0) {
      return res.status(400).json({
        message: "Add subjects before generating a study plan.",
      });
    }

    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    const now = new Date();

    const items = tasks
      .filter((task) => task.subject)
      .map((task) => {
        const due = new Date(task.dueDate);
        const daysLeft = Math.ceil(
          (due.getTime() - now.getTime()) / 86400000
        );

        let weight = priorityWeight[task.priority] || 2;

        if (daysLeft <= 1) weight += 3;
        else if (daysLeft <= 3) weight += 2;
        else if (daysLeft <= 7) weight += 1;

        return {
          title: task.title,
          subject: task.subject.name,
          dueDate: task.dueDate,
          priority: task.priority,
          weight,
          duration: 30,
          source: "task",
        };
      });

    if (items.length === 0) {
      subjects.forEach((subject) => {
        items.push({
          title: `Study ${subject.name}`,
          subject: subject.name,
          priority: "Medium",
          weight: 2,
          duration: 30,
          source: "subject",
        });
      });
    }

  items.sort((a, b) => {
  const priorityDifference =
    (priorityWeight[b.priority] || 2) -
    (priorityWeight[a.priority] || 2);

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  return b.weight - a.weight;
});

    const availableMinutes = Math.floor(hours * 60);
    const sessionMinutes = 30;
    const breakMinutes = 5;
    const maxSessions = Math.floor(
      (availableMinutes + breakMinutes) / (sessionMinutes + breakMinutes)
    );

    const selectedItems = items.slice(0, Math.max(1, maxSessions));
    const plan = [];
    let currentMinutes = 0;

    selectedItems.forEach((item, index) => {
      if (currentMinutes + sessionMinutes > availableMinutes) return;

      plan.push({
        ...item,
        id: `${index + 1}`,
        startMinute: currentMinutes,
        endMinute: currentMinutes + sessionMinutes,
      });

      currentMinutes += sessionMinutes + breakMinutes;
    });

    res.json({
      message: "Study plan generated successfully",
      availableHours: hours,
      totalStudyMinutes: plan.length * sessionMinutes,
      sessions: plan,
      tips: [
        "Start with high-priority tasks and approaching deadlines.",
        "Take a short break between study sessions.",
        "Mark tasks complete as you finish them.",
      ],
    });
  } catch (error) {
    console.error("Study plan generation error:", error.message);
    res.status(500).json({ message: "Failed to generate study plan." });
  }
});

module.exports = router;
