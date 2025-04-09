const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Question schema with choices
const questionSchema = new mongoose.Schema({
  text: String,
  choices: [String]  // Array of strings
});

// Define the categories as an enum
const categoriesEnum = [
  "Cognitive and Intelligence Tests",
  "Personality Tests",
  "Neuropsychological Tests",
  "Achievement and Educational Tests",
  "Diagnostic and Clinical Tests",
  "Projective Tests",
  "Behavioral and Observational Tests",
  "Attitude and Opinion Tests",
  "Vocational and Career Tests",
  "Social and Emotional Intelligence Tests",
  "Stress and Coping Tests",
  "Memory and Attention Tests"
];

// Test schema
const testSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: categoriesEnum  // Use enum to restrict the category values
  },
  duration: { type: Number, required: true },
  image: { type: String },

  questions: [questionSchema] 
});

// Create Test model
const Test = mongoose.model('Test', testSchema);

module.exports = Test;
