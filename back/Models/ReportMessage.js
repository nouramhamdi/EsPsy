const mongoose = require("mongoose");

const reportMessageSchema = new mongoose.Schema({
  reporter: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GroupDiscussion",
    required: true
  },
  message: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  status: {
    type: String,
    enum: ["in progress", "handled"],
    default: "in progress"
  }
}, { timestamps: true });

module.exports = mongoose.model("ReportMessage", reportMessageSchema);