const ChatSession = require("../Models/ChatSession");
const axios = require("axios");
const mongoose = require("mongoose");

const OLLAMA_API_URL = "http://127.0.0.1:11434/api/generate";

const SYSTEM_PROMPT = `
You are a proactive and empathetic AI mental health assistant dedicated solely to supporting users with their mental well-being. When a user expresses distress (e.g., "can u help me i feel overwhelming"), immediately offer clear, step-by-step guidance they can use right away. Your response must include the following:

1. **Empathy:** Begin by acknowledging their feelings with a warm, supportive tone.
2. **Actionable Steps:** Provide 3-4 specific, practical strategies to help ease their overwhelm. For example:
   - A brief deep breathing exercise (explain how to do it).
   - A grounding or mindfulness technique.
   - A suggestion to take a short break or a walk.
   - A simple self-care tip like drinking water or stretching.
3. **Encouragement:** Encourage the user to try these steps immediately and mention that these techniques can help in moments of distress.
4. **Professional Help (Only if Needed):** If the situation seems very severe or doesn’t improve after the initial steps, gently recommend considering professional support—but only as an additional option, not the primary solution.
5. **Brevity & Clarity:** Keep your response concise, friendly, and direct, as if you were chatting in a messenger app.
6. **Off-Topic Restriction:** If a user asks about topics unrelated to mental health, reply with: "I'm here to assist with your well-being. I can't discuss this topic."

Follow these guidelines strictly so that your advice remains practical and focused on immediate self-help for mental well-being.`;

// Start new chat session
module.exports.startSession = async (req, res) => {
  try {
    const { userId, aiId } = req.body;
    
    const newSession = new ChatSession({
      user: userId,
      espsyAI: aiId
    });

    await newSession.save();
    res.status(201).json(newSession);
  } catch (error) {
    res.status(500).json({ error: "Failed to start session" });
  }
};

// Add message and get AI response
module.exports.addMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    // Save user message
    const session = await ChatSession.findByIdAndUpdate(
      sessionId,
      { $push: { messages: { content: message, senderType: "user" } } },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Generate AI response
    const fullPrompt = `${SYSTEM_PROMPT}\nUser: ${message}\nAI:`;
    const response = await axios.post(OLLAMA_API_URL, {
      model: "deepseek-r1:1.5b",
      prompt: fullPrompt,
      stream: false,
    });

    let aiResponse = response.data.response
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .trim();

    // Save AI response
    const updatedSession = await ChatSession.findByIdAndUpdate(
      sessionId,
      { $push: { messages: { content: aiResponse, senderType: "ai" } } },
      { new: true }
    );

    res.json({
      response: aiResponse,
      session: updatedSession
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to process message" });
  }
};

// Get chat history
module.exports.getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findById(sessionId)
      .populate("user", "username")
      .populate("espsyAI", "name");

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve historyggg" });
  }
};

// Get sessions by user and AI ID
// Get sessions by user and AI ID
module.exports.getSessionId = async (req, res) => {
    try {
      const { userId, aiId } = req.body;
  
      if (!userId || !aiId) {
        return res.status(400).json({ error: "Missing user ID or AI ID" });
      }

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userId) || 
          !mongoose.Types.ObjectId.isValid(aiId)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const session = await ChatSession.findOne(
        { 
          user: userId, 
          espsyAI: aiId 
        },
        '_id createdAt' // Include both fields
      )
      .sort({ createdAt: -1 })
      .lean();

      if (!session) {
        return res.status(204).json({ error: "Session not found", found : false });
      }

      res.json({
        session: {
          id: session._id,
          created: session.createdAt
        }
        , found : true
      });
    } catch (error) {
      console.error("Session ID Error:", error);
      res.status(500).json({ 
        error: "Internal server error",
        message: error.message 
      });
    }
};