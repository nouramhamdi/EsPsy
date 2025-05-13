const express = require("express");
const router = express.Router();
const Post = require("../Models/Post");
const upload = require("../middlewares/uploadrania");

router.post("/create", upload.array("media", 5), async (req, res) => {
  try {
    const mediaPaths = req.files.map((file) => file.filename);
    const post = new Post({
      content: req.body.content,
      media: mediaPaths,
      author: req.body.userId,
      likedBy: [], // Ensure likedBy is initialized
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/report", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.reported = true;
    await post.save();
    res.status(200).json({ message: "Reported" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id/comments/:commentId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.comments = post.comments.filter((c) => c._id.toString() !== req.params.commentId);
    await post.save();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/comments", upload.single("media"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const loggedUser = JSON.parse(req.body.loggedUser || "{}");
    const newComment = {
      author: loggedUser.fullname || "Anonymous",
      authorId: loggedUser.id, // Add authorId
      text: req.body.text || "",
      media: req.file ? req.file.filename : null,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalComments = post.comments.length;
    const comments = post.comments.slice(startIndex, endIndex);

    res.status(200).json({
      comments,
      totalComments,
      totalPages: Math.ceil(totalComments / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/liked/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ likedBy: req.params.userId }).sort({ createdAt: -1 });
    const postsWithLikedBy = posts.map((post) => ({
      ...post.toObject(),
      likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
    }));
    res.json(postsWithLikedBy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
    if (likedBy.includes(userId)) {
      post.likedBy = likedBy.filter((id) => id.toString() !== userId);
    } else {
      post.likedBy.push(userId);
    }

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enhanced endpoint to edit a post
router.put("/:id", upload.array("media", 5), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!req.body.content && !req.files) {
      return res.status(400).json({ error: "Content or media is required for update" });
    }

    const mediaPaths = req.files && req.files.length > 0 
      ? req.files.map((file) => file.filename) 
      : post.media;

    post.content = req.body.content || post.content;
    post.media = mediaPaths;

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error editing post:", err);
    res.status(500).json({ error: `Failed to update post: ${err.message}` });
  }
});

// Enhanced endpoint to edit a comment
router.put("/:id/comments/:commentId", upload.single("media"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.find((c) => c._id.toString() === req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (!req.body.text && !req.file) {
      return res.status(400).json({ error: "Text or media is required for update" });
    }

    comment.text = req.body.text || comment.text;
    comment.media = req.file ? req.file.filename : comment.media;

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    console.error("Error editing comment:", err);
    res.status(500).json({ error: `Failed to update comment: ${err.message}` });
  }
});

module.exports = router;