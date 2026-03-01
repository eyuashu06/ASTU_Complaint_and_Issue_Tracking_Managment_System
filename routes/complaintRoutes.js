const express = require("express");
const router = express.Router();

const upload = require("../uploads/uploads");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  createComplaint,
  getComplaints,
  updateComplaint,
  deleteComplaint
} = require("../controllers/complaintController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/", 
  auth, 
  role("student"), 
  upload.array("attachments", 5),
   createComplaint
);

router.get("/", auth, role("department", "admin"), getComplaints);

router.patch("/:id", authMiddleware, updateComplaint);
router.delete("/:id", authMiddleware, deleteComplaint);

module.exports = router;