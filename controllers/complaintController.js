const Complaint = require("../models/Complaint");


// Create complaint – student
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, location, anonymous, contactPreference } = req.body;
    const attachments = req.files ? req.files.map(f => f.path) : [];

    const complaint = new Complaint({
      title, description, category, priority, location,
      attachments, anonymous, contactPreference,
      student: req.user.id
    });

    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};


// Get complaints – student sees their own, department/admin sees all
exports.getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "student") query = { student: req.user.id };

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

    if (status) complaint.status = status;
    if (remarkMessage) {
      complaint.remarks.push({
        message: remarkMessage,
        department: req.user.id
      });
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(req.params.id)
      .populate("student", "name email role")
      .populate("remarks.department", "name email role");

    res.status(200).json(updatedComplaint);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};