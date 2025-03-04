const express = require("express");
const axios = require("axios");

const router = express.Router();
const OLLAMA_API_URL = "http://127.0.0.1:11434/api/generate";

// System prompt to guide Deepseek AI
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

router.post("/chatbot", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        // Construct the full prompt with system instructions
        const fullPrompt = `${SYSTEM_PROMPT}\nUser: ${prompt}\nAI:`;

        // Request response from Deepseek AI
        const response = await axios.post(OLLAMA_API_URL, {
            model: "deepseek-r1:1.5b",
            prompt: fullPrompt,
            stream: false,
        });

        let chatbotResponse = response.data.response;

        // Remove <think> ... </think> sections using regex
        chatbotResponse = chatbotResponse.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        res.json({ response: chatbotResponse });
    } catch (error) {
        console.error("Error communicating with Ollama:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
