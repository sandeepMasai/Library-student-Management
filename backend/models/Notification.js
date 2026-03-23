const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    targetId: { type: String, default: "all", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
