const Complaint = require("../models/Complaint");
const sendEmail = require("../utils/mailer");
const fs = require("fs");
const path = require("path");

// Create complaint – student
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, location, contactPreference } = req.body;

    // prepare attachments
    const emailAttachments = req.files
      ? req.files.map(file => ({
          filename: file.originalname,
          path: file.path
        }))
      : [];

    // create complaint
    const complaint = new Complaint({
      title,
      description,
      category,
      priority,
      location,
      contactPreference,
      attachments: emailAttachments,
      student: req.user.id
    });

    await complaint.save();

    // prepare recipients
    const recipients = [];
    if (process.env.ADMIN_EMAIL) {
      recipients.push(process.env.ADMIN_EMAIL);
    }

    // send email
    if (recipients.length > 0) {
      await sendEmail({
        to: recipients,
        subject: `Complaint Submitted: ${title}`,
        text: `Your complaint "${title}" has been submitted successfully and is now Open.`,
        html: `<p>Hello,</p><p>Your complaint "<b>${title}</b>" has been submitted successfully and is now <b>Open</b>.</p>`
      });
    }

    res.status(201).json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get complaints – student sees their own, department/admin sees all
exports.getComplaints = async (req, res) => {
  try {
    const { status, priority, category } = req.query; // optional filters
    let query = {};

    // Students see only their own complaints
    if (req.user.role === "student") {
      query.student = req.user.id;
    }

    // Optional filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .populate("student", "name email role") // populate student info
      .populate("remarks.department", "name email role") // populate department in remarks
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

// Update complaint – department/admin
exports.updateComplaint = async (req, res) => {
  try {
    const { status, remarkMessage } = req.body;

    if (!["department", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // fetch complaint
    const complaint = await Complaint.findById(req.params.id).populate(
      "student",
      "name email contactPreference"
    );
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // set status and department message
    if (status) complaint.status = status;

    let message = remarkMessage;
    if (!message && status === "In Progress") message = "Department started working on the issue";
    if (!message && status === "Resolved") message = "Issue resolved by the department";

    if (message) {
      complaint.remarks.push({
        message,
        department: req.user.id,
        createdAt: new Date()
      });
    }

    await complaint.save();

    // prepare recipients
    const recipients = [];
    if (process.env.ADMIN_EMAIL) recipients.push(process.env.ADMIN_EMAIL);

    // send email
    if (recipients.length > 0 && status) {
      await sendEmail({
        to: recipients,
        subject: `Complaint Updated: ${complaint.title}`,
        text: `Your complaint "${complaint.title}" status has been updated to ${complaint.status}.\n\nMessage from department: ${message}`,
        html: `<p>Hello,</p>
               <p>Your complaint "<b>${complaint.title}</b>" status has been updated to <b>${complaint.status}</b>.</p>
               <p><b>Message from department:</b> ${message}</p>`
      });
    }

    res.status(200).json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

// Delete complaint – admin only
exports.deleteComplaint = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // delete attached files
    if (complaint.attachments && complaint.attachments.length > 0) {
      complaint.attachments.forEach(file => {
        const filePath = path.join(__dirname, "..", file.path);
        fs.unlink(filePath, err => {
          if (err) console.error("Failed to delete attachment:", err);
        });
      });
    }

    await complaint.deleteOne();
    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};