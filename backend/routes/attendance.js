const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const AttendanceQr = require("../models/AttendanceQr");
const Student = require("../models/Student");

const router = express.Router();

const LIBRARY_ID = process.env.LIBRARY_ID || "library-main";
const JWT_SECRET = process.env.JWT_SECRET || "library-attendance-secret";
const AUTH_JWT_SECRET = process.env.AUTH_JWT_SECRET || process.env.JWT_SECRET || "library-auth-secret";

async function repairAttendanceIndexes() {
  try {
    const indexes = await Attendance.collection.indexes();
    for (const idx of indexes) {
      if (!idx.unique || !idx.name || idx.name === "_id_") continue;
      const keys = Object.keys(idx.key || {});
      const isExpectedUnique =
        keys.length === 2 &&
        keys.includes("studentId") &&
        keys.includes("attendanceDate") &&
        Number(idx.key.studentId) === 1 &&
        Number(idx.key.attendanceDate) === 1;
      const badUnique = !isExpectedUnique;
      if (badUnique) {
        await Attendance.collection.dropIndex(idx.name);
      }
    }
    await Attendance.collection.createIndex(
      { studentId: 1, attendanceDate: 1 },
      { unique: true, name: "studentId_1_attendanceDate_1" }
    );
  } catch {
    // Best-effort self-heal only.
  }
}

function toResponse(attendance) {
  const safeDate =
    attendance?.date instanceof Date
      ? attendance.date.toISOString()
      : attendance?.date
        ? new Date(attendance.date).toISOString()
        : new Date().toISOString();

  return {
    id: attendance?._id ? attendance._id.toString() : "",
    studentId: attendance?.studentId || "",
    date: safeDate,
  };
}

function toDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function getActiveQr() {
  const now = new Date();
  return AttendanceQr.findOne({ expiresAt: { $gt: now } }).sort({ generatedAt: -1 });
}

function isWithinAttendanceWindow() {
  const now = new Date();
  const hour = now.getHours();
  // Allowed: 07:00 to 23:59
  return hour >= 7 && hour <= 23;
}

router.get("/token", async (_req, res) => {
  try {
    const active = await getActiveQr();
    if (!active) {
      return res.json({ token: null, libraryId: LIBRARY_ID, generated: false });
    }
    return res.json({
      token: active.token,
      libraryId: active.libraryId,
      generatedAt: active.generatedAt.toISOString(),
      expiresAt: active.expiresAt.toISOString(),
      generated: true,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch QR token", error: error.message });
  }
});

router.post("/token", async (_req, res) => {
  try {
    const existing = await getActiveQr();
    if (existing) {
      return res.json({
        token: existing.token,
        libraryId: existing.libraryId,
        generatedAt: existing.generatedAt.toISOString(),
        expiresAt: existing.expiresAt.toISOString(),
        created: false,
      });
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    const token = jwt.sign(
      { libraryId: LIBRARY_ID },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    const created = await AttendanceQr.create({
      libraryId: LIBRARY_ID,
      token,
      generatedAt: now,
      expiresAt,
    });

    return res.json({
      token: created.token,
      libraryId: created.libraryId,
      generatedAt: created.generatedAt.toISOString(),
      expiresAt: created.expiresAt.toISOString(),
      created: true,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate QR token", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const dateQuery = req.query.date ? new Date(String(req.query.date)) : new Date();
    if (Number.isNaN(dateQuery.getTime())) {
      return res.status(400).json({ message: "Invalid date. Use YYYY-MM-DD" });
    }
    const dateKey = toDateKey(dateQuery);
    const list = await Attendance.find({ attendanceDate: dateKey }).sort({ date: -1 });
    return res.json(list.map(toResponse));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch attendance", error: error.message });
  }
});

router.get("/today", async (_req, res) => {
  try {
    const todayKey = toDateKey(new Date());
    const list = await Attendance.find({ attendanceDate: todayKey }).sort({ date: -1 });
    return res.json(list.map(toResponse));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch attendance", error: error.message });
  }
});

router.get("/student-logs/:studentId", async (req, res) => {
  try {
    const studentId = String(req.params.studentId || "").trim();
    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }
    const limit = Math.max(1, Math.min(50, Number(req.query.limit || 10)));
    const list = await Attendance.find({ studentId }).sort({ date: -1 }).limit(limit);
    return res.json(
      list.map((item) => ({
        id: item._id.toString(),
        date: item.date instanceof Date ? item.date.toISOString() : new Date(item.date).toISOString(),
        attendanceDate: item.attendanceDate,
        status: "completed",
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch student activity", error: error.message });
  }
});

router.get("/student/:studentId", async (req, res) => {
  try {
    const studentId = String(req.params.studentId || "").trim();
    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    const now = new Date();
    const year = Number(req.query.year || now.getFullYear());
    const month = Number(req.query.month || now.getMonth() + 1);

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: "Invalid year/month" });
    }

    const monthPrefix = `${year}-${String(month).padStart(2, "0")}-`;

    const list = await Attendance.find({
      studentId,
      attendanceDate: { $regex: `^${monthPrefix}` },
    }).sort({ date: 1 });

    const seen = new Set();
    const result = [];
    for (const item of list) {
      const dateKey = toDateKey(new Date(item.date));
      if (seen.has(dateKey)) continue;
      seen.add(dateKey);
      result.push({ date: dateKey, status: "present" });
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch student attendance", error: error.message });
  }
});

router.post("/mark", async (req, res) => {
  try {
    const { token } = req.body || {};
    const scannedToken = String(token || "").trim();
    const authHeader = String(req.headers.authorization || "");
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!bearer) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let authPayload;
    try {
      authPayload = jwt.verify(bearer, AUTH_JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid auth token" });
    }

    if (!authPayload || authPayload.role !== "student" || !authPayload.userId) {
      return res.status(403).json({ message: "Only student can mark attendance" });
    }
    const normalizedStudentId = String(authPayload.userId).trim();
    if (!mongoose.Types.ObjectId.isValid(normalizedStudentId)) {
      return res.status(400).json({ message: "Invalid student account" });
    }

    // 1) पहले check करो आज attendance already marked है या नहीं
    const now = new Date();
    const todayKey = toDateKey(now);
    const existing = await Attendance.findOne({
      studentId: normalizedStudentId,
      attendanceDate: todayKey,
    });
    if (existing) {
      return res.json({
        ok: true,
        alreadyMarked: true,
        message: "Today s attendance has already been marked. ✅",
        attendance: toResponse(existing),
      });
    }

    if (!scannedToken) {
      return res.status(400).json({ message: "token is required" });
    }

    const active = await getActiveQr();
    if (!active) return res.status(400).json({ message: "Attendance QR is not generated" });
    if (active.token !== scannedToken) return res.status(400).json({ message: "Invalid QR token" });

    try {
      const payload = jwt.verify(scannedToken, JWT_SECRET);
      if (!payload || payload.libraryId !== LIBRARY_ID) {
        return res.status(400).json({ message: "Invalid QR token" });
      }
    } catch {
      return res.status(400).json({ message: "QR token expired or invalid" });
    }

    if (!isWithinAttendanceWindow()) {
      return res.status(400).json({ message: "Attendance allowed only between 7:00 AM and 11:59 PM" });
    }

    const student = await Student.findById(normalizedStudentId);
    if (!student) {
      return res.status(400).json({ message: "Student not found" });
    }
    if (student.isBlocked) {
      return res.status(403).json({ message: "Student is blocked" });
    }

    const created = await Attendance.create({
      studentId: normalizedStudentId,
      date: now,
      attendanceDate: todayKey,
    });
    return res.status(201).json({
      ok: true,
      message: "Attendance Marked",
      attendance: toResponse(created),
    });
  } catch (error) {
    if (error?.code === 11000) {
      const now = new Date();
      const todayKey = toDateKey(now);
      const authHeader = String(req.headers.authorization || "");
      const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
      let normalizedStudentId = "";
      try {
        const authPayload = bearer ? jwt.verify(bearer, AUTH_JWT_SECRET) : null;
        normalizedStudentId = String(authPayload?.userId || "").trim();
      } catch {
        normalizedStudentId = "";
      }
      if (!mongoose.Types.ObjectId.isValid(normalizedStudentId)) {
        return res.status(400).json({ message: "Invalid student account" });
      }
      const sameStudentToday = await Attendance.findOne({
        studentId: normalizedStudentId,
        attendanceDate: todayKey,
      });
      if (sameStudentToday) {
        return res.json({
          ok: true,
          alreadyMarked: true,
          message: "Today s attendance has already been marked ✅",
          attendance: toResponse(sameStudentToday),
        });
      }

      // Self-heal bad unique indexes from older versions and retry once.
      await repairAttendanceIndexes();
      const recheck = await Attendance.findOne({
        studentId: normalizedStudentId,
        attendanceDate: todayKey,
      });
      if (recheck) {
        return res.json({
          ok: true,
          alreadyMarked: true,
          message: "Today s attendance has already been marked ✅",
          attendance: toResponse(recheck),
        });
      }

      try {
        const retried = await Attendance.create({
          studentId: normalizedStudentId,
          date: now,
          attendanceDate: toDateKey(now),
        });
        return res.status(201).json({
          ok: true,
          message: "Attendance Marked",
          attendance: toResponse(retried),
        });
      } catch (retryError) {
        return res.status(500).json({
          message: "Attendance save failed. Please try again.",
          error: retryError.message,
        });
      }
    }
    return res.status(500).json({ message: "Failed to mark attendance", error: error.message });
  }
});

module.exports = router;
