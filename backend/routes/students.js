const express = require("express");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const router = express.Router();
const AUTH_JWT_SECRET = process.env.AUTH_JWT_SECRET || process.env.JWT_SECRET || "library-auth-secret";

function toStudentResponse(student) {
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

function parseJoinDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function addThirtyDays(date) {
  const next = new Date(date);
  next.setDate(next.getDate() + 30);
  return next;
}

function getAuthStudentId(req) {
  const authHeader = String(req.headers.authorization || "");
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return null;
  try {
    const payload = jwt.verify(token, AUTH_JWT_SECRET);
    if (!payload || payload.role !== "student" || !payload.userId) return null;
    return String(payload.userId).trim();
  } catch {
    return null;
  }
}

router.get("/", async (_req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students.map(toStudentResponse));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, mobile, username, pin, joinDate, feeAmount, feeStatus, isBlocked = false } = req.body;
    const parsedJoinDate = parseJoinDate(joinDate);
    if (!name || !mobile || !username || !pin || feeAmount === undefined || !feeStatus || !parsedJoinDate) {
      return res.status(400).json({ message: "Missing or invalid required fields" });
    }

    const student = await Student.create({
      name,
      mobile,
      username,
      pin,
      joinDate: parsedJoinDate,
      expiryDate: addThirtyDays(parsedJoinDate),
      feeAmount: Number(feeAmount),
      feeStatus,
      isBlocked,
    });

    return res.status(201).json(toStudentResponse(student));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username or mobile already exists" });
    }
    return res.status(500).json({ message: "Failed to create student", error: error.message });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const studentId = getAuthStudentId(req);
    if (!studentId) return res.status(401).json({ message: "Unauthorized" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.json(toStudentResponse(student));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const studentId = getAuthStudentId(req);
    if (!studentId) return res.status(401).json({ message: "Unauthorized" });

    const { name, mobile, username, pin } = req.body || {};
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (mobile !== undefined) updates.mobile = mobile;
    if (username !== undefined) updates.username = username;
    if (pin !== undefined) updates.pin = pin;

    const updated = await Student.findByIdAndUpdate(studentId, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Student not found" });
    return res.json(toStudentResponse(updated));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username or mobile already exists" });
    }
    return res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, username, pin, joinDate, feeAmount, feeStatus, isBlocked } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (mobile !== undefined) updates.mobile = mobile;
    if (username !== undefined) updates.username = username;
    if (pin !== undefined) updates.pin = pin;
    if (feeAmount !== undefined) updates.feeAmount = Number(feeAmount);
    if (feeStatus !== undefined) updates.feeStatus = feeStatus;
    if (isBlocked !== undefined) updates.isBlocked = Boolean(isBlocked);

    if (joinDate !== undefined) {
      const parsedJoinDate = parseJoinDate(joinDate);
      if (!parsedJoinDate) {
        return res.status(400).json({ message: "Invalid joining date" });
      }
      updates.joinDate = parsedJoinDate;
      updates.expiryDate = addThirtyDays(parsedJoinDate);
    }

    const updated = await Student.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Student not found" });

    return res.json(toStudentResponse(updated));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username or mobile already exists" });
    }
    return res.status(500).json({ message: "Failed to update student", error: error.message });
  }
});

router.patch("/:id/block", async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Student.findById(id);
    if (!existing) return res.status(404).json({ message: "Student not found" });

    const nextValue = typeof req.body?.isBlocked === "boolean" ? req.body.isBlocked : !existing.isBlocked;
    existing.isBlocked = nextValue;
    await existing.save();

    return res.json(toStudentResponse(existing));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update block status", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete student", error: error.message });
  }
});

module.exports = router;
