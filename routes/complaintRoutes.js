const express = require("express");
const router = express.Router();

const upload = require("../uploads/uploads");

const authMiddleware = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createComplaint,
  getComplaints,
  updateComplaint,
  deleteComplaint
} = require("../controllers/complaintController");


router.post(
  "/", 
  authMiddleware, 
  role("student"), 
  upload.array("attachments", 5),
   createComplaint
);

router.get("/", authMiddleware, role("department", "admin"), getComplaints);

router.patch("/:id", authMiddleware , role("department", "admin"), updateComplaint);
router.delete("/:id", authMiddleware, role("admin") , deleteComplaint);

module.exports = router;