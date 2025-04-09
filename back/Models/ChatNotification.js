// models/ChatNotification.js
const mongoose = require("mongoose");

const chatNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GroupDiscussion",
    required: true,
  },
  content: {
    type: String,
    enum: ["sent a message","edited a message","uploaded a media message", "joined the group", "left the group", "deleted a message"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ChatNotification", chatNotificationSchema);