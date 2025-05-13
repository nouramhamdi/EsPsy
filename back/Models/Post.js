// models/Post.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  author: String,
  authorId: String, // Add authorId
  text: String,
  media: String,
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  content: String,
  media: [String],
  author: String,
  likedBy: { type: [String], default: [] }, // Use likedBy, not likes
  comments: [commentSchema],
  reported: Boolean,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);
