const express = require("express");
const router = express.Router();

const upload = require("../uploads/uploads");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createComplaint,
  getComplaints,
  updateComplaint
} = require("../controllers/complaintController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", auth, role("student"), upload.array("attachements", 5), createComplaint);

router.get("/", auth, role("department", "admin"), getComplaints);

router.patch("/:id", authMiddleware, updateComplaint);

module.exports = router;