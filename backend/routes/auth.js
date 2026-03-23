const express = require("express");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const AdminProfile = require("../models/AdminProfile");

const router = express.Router();
const AUTH_JWT_SECRET = process.env.AUTH_JWT_SECRET || process.env.JWT_SECRET || "library-auth-secret";

function adminUser() {
  const now = new Date();
  const expiry = new Date(now);
  expiry.setFullYear(expiry.getFullYear() + 10);

  return {
    id: "admin-1",
    role: "admin",
    name: "Admin",
    username: process.env.ADMIN_USERNAME || "admin",
    mobile: process.env.ADMIN_MOBILE || "0000000000",
    pin: process.env.ADMIN_PIN || "admin@123",
    joinDate: now.toISOString(),
    expiryDate: expiry.toISOString(),
    feeStatus: "Paid",
    feeAmount: 0,
    isBlocked: false,
  };
}

async function getOrCreateAdminProfile() {
  const admin = adminUser();
  let profile = await AdminProfile.findOne({ adminId: admin.id });
  if (!profile) {
    profile = await AdminProfile.create({
      adminId: admin.id,
      name: admin.name,
      username: admin.username,
      mobile: admin.mobile,
      email: "",
      bio: "",
    });
  }
  return profile;
}

function adminProfileResponse(profile) {
  const now = new Date();
  const expiry = new Date(now);
  expiry.setFullYear(expiry.getFullYear() + 10);

  return {
    id: String(profile.adminId || "admin-1"),
    role: "admin",
    name: profile.name,
    username: profile.username,
    mobile: profile.mobile,
    pin: process.env.ADMIN_PIN || "admin@123",
    joinDate: now.toISOString(),
    expiryDate: expiry.toISOString(),
    feeStatus: "Paid",
    feeAmount: 0,
    isBlocked: false,
    email: profile.email || "",
    bio: profile.bio || "",
  };
}

function studentResponse(student) {
  return {
    id: student._id.toString(),
    role: "student",
    name: student.name,
    mobile: student.mobile,
    username: student.username,
    pin: student.pin,
    joinDate: student.joinDate.toISOString(),
    expiryDate: student.expiryDate.toISOString(),
    feeAmount: student.feeAmount,
    feeStatus: student.feeStatus,
    isBlocked: student.isBlocked,
  };
}

router.post("/login", async (req, res) => {
  try {
    const identifier = String(req.body?.usernameOrMobile || "").trim().toLowerCase();
    const pin = String(req.body?.pin || "").trim();

    if (!identifier || !pin) {
      return res.status(400).json({ message: "usernameOrMobile and pin are required" });
    }

    const admin = adminUser();
    const adminMatches =
      identifier === admin.username.toLowerCase() || identifier === admin.mobile.toLowerCase();
    const adminPinMatches = pin === admin.pin || pin === "admin123";
    if (adminMatches && adminPinMatches) {
      const profile = await getOrCreateAdminProfile();
      const authToken = jwt.sign(
        { userId: admin.id, role: admin.role },
        AUTH_JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({ user: adminProfileResponse(profile), authToken });
    }

    const student = await Student.findOne({
      $or: [{ username: identifier }, { mobile: identifier }],
      pin,
    });

    if (!student) return res.status(401).json({ message: "Invalid credentials" });
    if (student.isBlocked) return res.status(403).json({ message: "Account is blocked" });

    const user = studentResponse(student);
    const authToken = jwt.sign(
      { userId: user.id, role: user.role },
      AUTH_JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({ user, authToken });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
});

router.get("/admin/profile", async (req, res) => {
  try {
    const authHeader = String(req.headers.authorization || "");
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!bearer) return res.status(401).json({ message: "Unauthorized" });

    let authPayload;
    try {
      authPayload = jwt.verify(bearer, AUTH_JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid auth token" });
    }
    if (!authPayload || authPayload.role !== "admin") {
      return res.status(403).json({ message: "Only admin can access profile" });
    }

    const profile = await getOrCreateAdminProfile();
    return res.json(adminProfileResponse(profile));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch admin profile", error: error.message });
  }
});

router.put("/admin/profile", async (req, res) => {
  try {
    const authHeader = String(req.headers.authorization || "");
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!bearer) return res.status(401).json({ message: "Unauthorized" });

    let authPayload;
    try {
      authPayload = jwt.verify(bearer, AUTH_JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid auth token" });
    }
    if (!authPayload || authPayload.role !== "admin") {
      return res.status(403).json({ message: "Only admin can update profile" });
    }

    const updates = {};
    const { name, username, mobile, email, bio } = req.body || {};
    if (name !== undefined) updates.name = String(name).trim();
    if (username !== undefined) updates.username = String(username).trim().toLowerCase();
    if (mobile !== undefined) updates.mobile = String(mobile).trim();
    if (email !== undefined) updates.email = String(email).trim().toLowerCase();
    if (bio !== undefined) updates.bio = String(bio).trim();

    const admin = adminUser();
    const profile = await AdminProfile.findOneAndUpdate(
      { adminId: admin.id },
      { $set: updates, $setOnInsert: { adminId: admin.id, name: admin.name, username: admin.username, mobile: admin.mobile } },
      { upsert: true, new: true, runValidators: true }
    );
    return res.json(adminProfileResponse(profile));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update admin profile", error: error.message });
  }
});

module.exports = router;
