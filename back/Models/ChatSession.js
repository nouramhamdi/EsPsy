const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  content: { 
    type: String,
    required: true,
    maxlength: 2000
  },
  senderType: {
    type: String,
    enum: ["user", "ai"],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  espsyAI: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EspsyAI",
    required: true
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ChatSession", chatSessionSchema);  