const express = require("express");
const router = express.Router();
const TestResponse = require("../Models/TestResponse");
const responseController = require("../Controllers/ResponseController");


router.put('/add-result/:id', responseController.addResult);

router.post("/", async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log the data received from frontend
    const { testId, userId, answers } = req.body;

    if (!testId || !userId || !answers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newResponse = new TestResponse({
      testId,
      userId,
      answers,
      createdAt: new Date(),
    });

    const savedResponse = await newResponse.save();
    res.status(201).json(savedResponse);
  } catch (error) {
    console.error("Error saving test response:", error);
    res.status(500).json({ message: "Failed to save test response" });
  }
});

module.exports = router;
