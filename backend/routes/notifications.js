const express = require("express");
const Notification = require("../models/Notification");

const router = express.Router();

function toResponse(notification) {
  return {
    id: notification._id.toString(),
    title: notification.title,
    message: notification.message,
    date: notification.date.toISOString(),
    targetId: notification.targetId,
  };
}

router.get("/", async (req, res) => {
  try {
    const studentId = req.query.studentId;
    const query = studentId ? { $or: [{ targetId: "all" }, { targetId: studentId }] } : {};
    const list = await Notification.find(query).sort({ date: -1 });
    res.json(list.map(toResponse));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, message, targetId = "all" } = req.body || {};
    if (!title || !message) {
      return res.status(400).json({ message: "title and message are required" });
    }

    const created = await Notification.create({
      title,
      message,
      targetId,
      date: new Date(),
    });

    return res.status(201).json(toResponse(created));
  } catch (error) {
    return res.status(500).json({ message: "Failed to send notification", error: error.message });
  }
});

module.exports = router;
