const Complaint = require("../models/Complaint");
const sendEmail = require("../utils/mailer");

// Create complaint – student
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, location, contactPreference } = req.body;

    const emailAttachments = req.files
      ? req.files.map(file => ({
          filename: file.originalname,
          path: file.path
        }))
      : [];

    const complaint = new Complaint({
      title, description, category, priority, location,
      contactPreference, 
      attachments: emailAttachments,
      student: req.user.id
    });

    await complaint.save();
    // send confirmation email to student
    await sendEmail({
      from: "eashenafi82@gmail.com",
      to: "eyuel.ashenafi@astu.edu.et",
      subject: `complaint Submitted: ${title}`,
      text: `Your complaint "${title}" has been submitted successfully and it is now Open.`,
      html: `<p> Hello,</p><p>Your complaint "<b>${title}</b>" has been submitted successfully and is now <b>Open</b>.</p>`,
      attachments: emailAttachments
    });

    
    res.status(201).json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};


// Get complaints – student sees their own, department/admin sees all
exports.getComplaints = async (req, res) => {
  try {

    const { status, priority, category } = req.query;

    let query = {};

    // student sees only their complaints
    if (req.user.role === "student") {
      query.student = req.user.id;
    }
    // optional filters
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (category) {
      query.category = category;
    }
    const complaints = await Complaint.find(query)
      .populate("student", "name email role")
      .populate("remarks.department", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

// Update complaint status and add remarks – department/admin
exports.updateComplaint = async (req, res) => {
  try {
    const { status, remarkMessage } = req.body;

    if (req.user.role !== "department" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (status) {
      complaint.status = status;
    }
     let message = remarkMessage;

    if (!message && status === "In Progress") {
      message = "Department started working on the issue";
    }

    if (!message && status === "Resolved") {
      message = "Issue resolved by the department";
    }
    if (message) {
      complaint.remarks.push({
        message: message,
        department: req.user.id,
        createdAt: new Date()
      });
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(req.params.id)
      .populate("student", "name email role")
      .populate("remarks.department", "name email role");

    // When status is updated
    if (status) {
      complaint.status = status;

      await sendEmail({
        to: updatedComplaint.student.email,
        subject: `Complaint Updated: ${complaint.title}`,
        text: `Your complaint "${complaint.title}" status has been updated to ${status}.\n\nMessage from department: ${message}`,
        html: `<p>Hello,</p>
               <p>Your complaint "<b>${complaint.title}</b>" status has been updated to <b>${status}</b>.</p>
               <p><b>Message from department:</b> ${message}</p>`
      }); 
    }

    res.status(200).json(updatedComplaint);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};

// Delete Complaint only done by admin
exports.deleteComplaint = async (req, res) => {
  try {
    // Only admin can delete
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Optional: Delete attached files
    if (complaint.attachments && complaint.attachments.length > 0) {
      complaint.attachments.forEach(file => {
        const filePath = path.join(__dirname, "..", file.path);
        fs.unlink(filePath, err => {
          if (err) console.error("Failed to delete attachment:", err);
        });
      });
    }

    // Delete complaint
    await complaint.deleteOne();

    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};