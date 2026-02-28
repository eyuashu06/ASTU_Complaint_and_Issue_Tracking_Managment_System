const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true,
    minlength: 20
  },

  category: {
    type: String,
    required: true,
  },

  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Urgent"],
    default: "Medium"
  },

  location: {
    type: String
  },

  attachments: [
    {
      type: String
    }
  ],

  contactPreference: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved"],
    default: "Open"
  },

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  remarks: [
    {
      message: String,
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("Complaint", ComplaintSchema);