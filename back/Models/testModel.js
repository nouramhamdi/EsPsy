// src/models/testModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Question schema with choices
const questionSchema = new mongoose.Schema({
  text: String,
  choices: [String]  // Array of strings
});

// Test schema
const testSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: Number, required: true },
  questions: [questionSchema]  // Array of questions
});

// Create Test model
const Test = mongoose.model('Test', testSchema);

module.exports = Test;