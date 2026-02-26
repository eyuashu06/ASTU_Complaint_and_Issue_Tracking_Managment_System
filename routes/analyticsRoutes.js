const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/analytics - Admin only
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Total complaints
    const totalComplaints = await Complaint.countDocuments();

    // Complaints by status
    const byStatus = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Complaints by category
    const byCategory = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Resolution rate
    const resolvedCount = await Complaint.countDocuments({ status: "Resolved" });
    const resolutionRate = totalComplaints > 0 ? ((resolvedCount / totalComplaints) * 100).toFixed(2) : 0;

    res.json({
      totalComplaints,
      byStatus,
      byCategory,
      resolvedCount,
      resolutionRate: resolutionRate + "%"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;