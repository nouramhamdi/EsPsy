const express = require("express");
const router = express.Router();
const chatbotController= require("../Controllers/chatbotController");

// Start new chat session
router.post("/sessions", chatbotController.startSession);

// Add message to existing session
router.post("/sessions/:sessionId/messages", chatbotController.addMessage);

// Get chat history
router.get("/sessions/:sessionId", chatbotController.getHistory);
router.post("/GetsessionId", chatbotController.getSessionId);

module.exports = router;