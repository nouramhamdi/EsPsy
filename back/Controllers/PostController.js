const Post = require("../Models/Post"); 
const path = require("path");
const fs = require("fs");

const createPost = async (req, res) => {
  const { title, content } = req.body;
  const media = req.files ? req.files.map(file => file.filename) : [];

  try {
    const newPost = new Post({
      title,
      content,
      media,
      author: req.user ? req.user.username : "Anonymous", // Optional: Adjust based on your authentication system
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const likePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.body.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }

    res.status(200).json(post);
  } catch (err) {
    console.error("Error liking post:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const commentPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      author: req.user?.username || `User ${req.body.userId}`,
      text: req.body.text,
    };

    post.comments.push(newComment);
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Server error" });
  }
};


  


module.exports = { createPost, getAllPosts, likePost ,commentPost};
