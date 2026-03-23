const mongoose = require("mongoose");

const adminProfileSchema = new mongoose.Schema(
  {
    adminId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, lowercase: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    bio: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminProfile", adminProfileSchema);
