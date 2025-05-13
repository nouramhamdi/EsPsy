const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const { OPENAI_API_KEY } = require('../config/openaiConfig');

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

// Middleware d'authentification
const checkAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Vous devez être connecté" });
  }
  next();
};

router.post('/chat/completions', checkAuth, async (req, res) => {
  try {
    const { model, messages, temperature, max_tokens } = req.body;

    if (!model || !messages) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 500
    });

    res.json(response);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ 
      error: 'Error processing OpenAI request',
      details: error.message
    });
  }
});

module.exports = router; 