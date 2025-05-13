import React, { useState, useEffect } from "react";
import axios from "axios";
import userServices from "../../Services/UserService";
import Groupname from "./Sidebar"; // Replace with actual Groupname component

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [users, setUsers] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [commentMedia, setCommentMedia] = useState({});
  const [commentPreview, setCommentPreview] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [commentPages, setCommentPages] = useState({});
  const [commentPagination, setCommentPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null); // State for dropdown visibility
  const [editPostId, setEditPostId] = useState(null); // State for editing post
  const [editPostContent, setEditPostContent] = useState(""); // State for edited post content
  const [editPostMedia, setEditPostMedia] = useState(null); // State for edited post media
  const [editPostPreview, setEditPostPreview] = useState(null); // State for edited post media preview
  const [editCommentId, setEditCommentId] = useState(null); // State for editing comment
  const [editCommentText, setEditCommentText] = useState(""); // State for edited comment text
  const [editCommentMedia, setEditCommentMedia] = useState(null); // State for edited comment media
  const [editCommentPreview, setEditCommentPreview] = useState(null); // State for edited comment media preview
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  const originalPosts = [...posts];

  // Log loggedUser for debugging
  console.log("Logged User:", loggedUser);

  // Fetch posts and initialize comment pagination
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/posts")
      .then(async (res) => {
        const postsWithLikedBy = res.data.map((post) => ({
          ...post,
          likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
        }));
        console.log("Fetched posts:", postsWithLikedBy); // Log posts
        setPosts(postsWithLikedBy);

        // Sequentially initialize pagination for each post
        for (const post of postsWithLikedBy) {
          await handleCommentPageChange(post._id, 1);
        }

        console.log("Comment Pages:", commentPages); // Log after initialization
        console.log("Comment Pagination:", commentPagination); // Log after initialization
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setLoading(false);
      });

    updateRecommendedPosts();
  }, []);

  // Function to update recommended posts
  const updateRecommendedPosts = () => {
    axios
      .get(`http://localhost:5000/posts/liked/${loggedUser._id}`)
      .then((res) => {
        const likedPosts = res.data.map((post) => ({
          ...post,
          likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
        }));
        const keywordCounts = {};
        likedPosts.forEach((post) => {
          const words = post.content.toLowerCase().split(/\s+/);
          words.forEach((word) => {
            if (word.length > 3) {
              keywordCounts[word] = (keywordCounts[word] || 0) + 1;
            }
          });
        });
        const topKeywords = Object.entries(keywordCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([word]) => word);

        axios.get("http://localhost:5000/posts").then((allPostsRes) => {
          const allPosts = allPostsRes.data.map((post) => ({
            ...post,
            likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
          }));
          const recommended = allPosts
            .filter(
              (post) =>
                !likedPosts.some((lp) => lp._id === post._id) &&
                topKeywords.some((keyword) =>
                  post.content.toLowerCase().includes(keyword)
                )
            )
            .slice(0, 5);
          setRecommendedPosts(recommended);
        });
      })
      .catch((err) => {
        console.error("Error fetching liked posts:", err);
      });
  };

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userServices.getAllUsers();
        console.log("Fetched users:", data.users); // Log users
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Handle media change for posts
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    setMedia(file);
    if (file && (file.type.startsWith("image/") || file.type === "image/gif")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // Handle media change for comments
  const handleCommentMediaChange = (e, postId) => {
    const file = e.target.files[0];
    setCommentMedia({ ...commentMedia, [postId]: file });
    if (file && (file.type.startsWith("image/") || file.type === "image/gif")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCommentPreview({ ...commentPreview, [postId]: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      setCommentPreview({ ...commentPreview, [postId]: null });
    }
  };

  // Handle media change for editing posts
  const handleEditPostMediaChange = (e) => {
    const file = e.target.files[0];
    setEditPostMedia(file);
    if (file && (file.type.startsWith("image/") || file.type === "image/gif")) {
      const reader = new FileReader();
      reader.onloadend = () => setEditPostPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setEditPostPreview(null);
    }
  };

  // Handle media change for editing comments
  const handleEditCommentMediaChange = (e) => {
    const file = e.target.files[0];
    setEditCommentMedia(file);
    if (file && (file.type.startsWith("image/") || file.type === "image/gif")) {
      const reader = new FileReader();
      reader.onloadend = () => setEditCommentPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setEditCommentPreview(null);
    }
  };

  // Submit new post
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("content", content);
    formData.append("userId", loggedUser._id);
    if (media) formData.append("media", media);

    try {
      const res = await axios.post("http://localhost:5000/posts/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newPost = { ...res.data, likedBy: Array.isArray(res.data.likedBy) ? res.data.likedBy : [] };
      setPosts([newPost, ...posts]);
      setContent("");
      setMedia(null);
      setPreview(null);
      await handleCommentPageChange(newPost._id, 1); // Initialize pagination for new post
      setLoading(false);
    } catch (error) {
      console.error("Error submitting post:", error);
      setLoading(false);
    }
  };

  // Like a post
  const handleLike = async (id) => {
    try {
      const updatedPosts = posts.map((post) => {
        if (post._id === id) {
          const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
          const isLiked = likedBy.includes(loggedUser._id);
          return {
            ...post,
            likedBy: isLiked
              ? likedBy.filter((userId) => userId !== loggedUser._id)
              : [...likedBy, loggedUser._id],
          };
        }
        return post;
      });
      setPosts(updatedPosts);
      const res = await axios.put(`http://localhost:5000/posts/${id}/like`, {
        userId: loggedUser._id,
      });
      setPosts(
        posts.map((post) =>
          post._id === id
            ? { ...res.data, likedBy: Array.isArray(res.data.likedBy) ? res.data.likedBy : [] }
            : post
        )
      );
      updateRecommendedPosts();
    } catch (error) {
      console.error("Error liking post:", error);
      setPosts(originalPosts);
    }
  };

  // Submit a comment
  const handleCommentSubmit = async (postId) => {
    if (!commentText[postId] && !commentMedia[postId]) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("text", commentText[postId] || "");
    formData.append("loggedUser", JSON.stringify({ fullname: loggedUser.fullname, id: loggedUser._id }));
    if (commentMedia[postId]) formData.append("media", commentMedia[postId]);

    try {
      const res = await axios.post(`http://localhost:5000/posts/${postId}/comments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? { ...res.data, likedBy: Array.isArray(res.data.likedBy) ? res.data.likedBy : [] }
            : post
        )
      );
      setCommentText({ ...commentText, [postId]: "" });
      setCommentMedia({ ...commentMedia, [postId]: null });
      setCommentPreview({ ...commentPreview, [postId]: null });
      setShowCommentBox({ ...showCommentBox, [postId]: false });
      await handleCommentPageChange(postId, 1);
      setLoading(false);
    } catch (error) {
      console.error("Error submitting comment:", error);
      setLoading(false);
    }
  };

  // Delete a post
  const handleDeletePost = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/posts/${id}`);
      setPosts(posts.filter((p) => p._id !== id));
      setRecommendedPosts(recommendedPosts.filter((p) => p._id !== id));
      setCommentPages((prev) => {
        const newPages = { ...prev };
        delete newPages[id];
        return newPages;
      });
      setCommentPagination((prev) => {
        const newPagination = { ...prev };
        delete newPagination[id];
        return newPagination;
      });
      setDropdownOpen(null); // Close dropdown after action
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (postId, commentId) => {
    try {
      await axios.delete(`http://localhost:5000/posts/${postId}/comments/${commentId}`);
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? { ...post, comments: post.comments.filter((c) => c._id !== commentId) }
            : post
        )
      );
      await handleCommentPageChange(postId, commentPages[postId] || 1);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Edit a post
  const handleEditPost = async (postId) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("content", editPostContent);
    if (editPostMedia) formData.append("media", editPostMedia);

    try {
      const res = await axios.put(`http://localhost:5000/posts/${postId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? { ...res.data, likedBy: Array.isArray(res.data.likedBy) ? res.data.likedBy : [] }
            : post
        )
      );
      setEditPostId(null);
      setEditPostContent("");
      setEditPostMedia(null);
      setEditPostPreview(null);
      setDropdownOpen(null);
      setLoading(false);
    } catch (error) {
      console.error("Error editing post:", error);
      setLoading(false);
    }
  };

  // Edit a comment
  const handleEditComment = async (postId, commentId) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("text", editCommentText);
    if (editCommentMedia) formData.append("media", editCommentMedia);

    try {
      const res = await axios.put(`http://localhost:5000/posts/${postId}/comments/${commentId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? { ...res.data, likedBy: Array.isArray(res.data.likedBy) ? res.data.likedBy : [] }
            : post
        )
      );
      setEditCommentId(null);
      setEditCommentText("");
      setEditCommentMedia(null);
      setEditCommentPreview(null);
      await handleCommentPageChange(postId, commentPages[postId] || 1); // Refresh comments to reflect edit
      setLoading(false);
    } catch (error) {
      console.error("Error editing comment:", error);
      setLoading(false);
    }
  };

  // Start editing a post
  const startEditPost = (post) => {
    setEditPostId(post._id);
    setEditPostContent(post.content);
    setEditPostPreview(post.media && post.media.length > 0 ? `http://localhost:5000/uploads/${post.media[0]}` : null);
  };

  // Start editing a comment
  const startEditComment = (comment) => {
    setEditCommentId(comment._id);
    setEditCommentText(comment.text);
    setEditCommentPreview(comment.media ? `http://localhost:5000/uploads/${comment.media}` : null);
  };

  // Report a post
  const handleReportPost = async (postId) => {
    try {
      await axios.post(`http://localhost:5000/posts/${postId}/report`, {
        userId: loggedUser._id,
      });
      alert("Post reported. Thank you!");
    } catch (error) {
      console.error("Error reporting post:", error);
    }
  };

  // Change comment page
  const handleCommentPageChange = async (postId, page) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/posts/${postId}/comments?page=${page}&limit=2`
      );
      setCommentPages((prev) => ({ ...prev, [postId]: page }));
      setCommentPagination((prev) => ({
        ...prev,
        [postId]: {
          totalComments: res.data.totalComments,
          totalPages: res.data.totalPages,
          currentPage: res.data.currentPage,
        },
      }));
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: res.data.comments }
            : post
        )
      );
      console.log(`Pagination updated for post ${postId}:`, {
        page,
        totalPages: res.data.totalPages,
        totalComments: res.data.totalComments,
      });
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      // Initialize pagination with empty comments if API fails
      setCommentPages((prev) => ({ ...prev, [postId]: page }));
      setCommentPagination((prev) => ({
        ...prev,
        [postId]: {
          totalComments: 0,
          totalPages: 1,
          currentPage: page,
        },
      }));
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, comments: [] } : post
        )
      );
    }
  };

  // Share a post
  const handleShare = async (post) => {
    try {
      const shareData = {
        title: post.title || "Community Post",
        text: post.content,
        url: window.location.href,
      };
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        console.log("Sharing not supported.");
      }
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  // Get user avatar
  const getImageUrl = (user) => {
    console.log("User for image:", user);
    return user?.image_user
      ? `http://localhost:5000/uploads/${user.image_user}`
      : "https://via.placeholder.com/40";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-1/4 w-full">
            <div className="bg-white shadow rounded-lg p-4 sticky top-4">
              <div className="text-center">
                <img
                  src={getImageUrl(loggedUser)}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto mb-2 object-cover"
                />
                <h3 className="text-lg font-semibold">{loggedUser.fullname}</h3>
                <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Student Account
                </span>
              </div>
              <div className="mt-4">
                <div className="flex items-center py-2 border-b">
                  <span className="text-blue-600 mr-2">👤</span>
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium">{loggedUser.username || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center py-2">
                  <span className="text-blue-600 mr-2">👥</span>
                  <div>
                    <p className="text-sm text-gray-500">Your Groups</p>
                    <Groupname />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4 w-full">
    

            {/* Post Form */}
            <form onSubmit={handlePostSubmit} className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <img
                  src={getImageUrl(loggedUser)}
                  alt="Me"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <span className="font-medium">{loggedUser.fullname}</span>
              </div>
              <textarea
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Share your thoughts..."
                rows="4"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <div className="flex items-center mt-3">
                <label className="flex items-center text-blue-600 cursor-pointer mr-4">
                  <span className="mr-1">📷 Image/GIF</span>
                  <input
                    type="file"
                    accept="image/*,image/gif"
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                </label>
                <label className="flex items-center text-blue-600 cursor-pointer">
                  <span className="mr-1">🎥 Video</span>
                  <input
                    type="file"
                    accept="video/mp4"
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                </label>
              </div>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-3 w-full max-h-64 object-cover rounded"
                />
              )}
              <button
                type="submit"
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </form>

            {/* Recommended Posts */}
            {recommendedPosts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-blue-600 mb-4">
                  Recommended Posts
                </h3>
                {recommendedPosts.map((post) => {
                  const authorObj = users.find((u) => u._id === post.author) || {
                    fullname: "Anonymous",
                    username: "anonymous",
                  };
                  return (
                    <div key={post._id} className="bg-white shadow rounded-lg p-6 mb-6 relative">
                      <span className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        Recommended for You
                      </span>
                      <div className="flex items-center mb-3">
                        <img
                          src={getImageUrl(authorObj)}
                          alt={authorObj.fullname}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <h3 className="font-semibold">{authorObj.username}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {editPostId === post._id ? (
                        <div className="mb-4">
                          <textarea
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                            rows="4"
                            value={editPostContent}
                            onChange={(e) => setEditPostContent(e.target.value)}
                          />
                          <div className="flex items-center mt-3">
                            <label className="flex items-center text-blue-600 cursor-pointer mr-4">
                              <span className="mr-1">📷 Image/GIF</span>
                              <input
                                type="file"
                                accept="image/*,image/gif"
                                onChange={handleEditPostMediaChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {editPostPreview && (
                            <img
                              src={editPostPreview}
                              alt="Edit Preview"
                              className="mt-3 w-full max-h-64 object-cover rounded"
                            />
                          )}
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleEditPost(post._id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                              disabled={loading}
                            >
                              {loading ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => {
                                setEditPostId(null);
                                setEditPostContent("");
                                setEditPostMedia(null);
                                setEditPostPreview(null);
                              }}
                              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-800 mb-4">{post.content}</p>
                          {Array.isArray(post.media) &&
                            post.media.map((m, idx) =>
                              m.endsWith(".mp4") ? (
                                <video
                                  key={idx}
                                  controls
                                  className="w-full max-h-96 object-cover rounded mb-4"
                                >
                                  <source
                                    src={`http://localhost:5000/uploads/${m}`}
                                    type="video/mp4"
                                  />
                                </video>
                              ) : (
                                <img
                                  key={idx}
                                  src={`http://localhost:5000/uploads/${m}`}
                                  alt="Post media"
                                  className="w-full max-h-96 object-cover rounded mb-4"
                                />
                              )
                            )}
                        </>
                      )}
                      <div className="flex flex-wrap gap-2 items-center mb-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleLike(post._id)}
                            className="flex items-center text-blue-600 hover:bg-blue-100 px-3 py-1 rounded"
                          >
                            <span className="mr-1">👍</span> Like ({post.likedBy?.length || 0})
                          </button>
                          <button
                            onClick={() => handleShare(post)}
                            className="flex items-center text-blue-600 hover:bg-blue-100 px-3 py-1 rounded"
                          >
                            <span className="mr-1">🔗</span> Share
                          </button>
                          <button
                            onClick={() =>
                              setShowCommentBox({
                                ...showCommentBox,
                                [post._id]: !showCommentBox[post._id],
                              })
                            }
                            className="flex items-center text-blue-600 hover:bg-blue-100 px-3 py-1 rounded"
                          >
                            <span className="mr-1">💬</span> Comment
                          </button>
                          <button
                            onClick={() => handleReportPost(post._id)}
                            className="flex items-center text-yellow-600 hover:bg-yellow-100 px-3 py-1 rounded"
                          >
                            <span className="mr-1">⚠️</span> Report
                          </button>
                        </div>
                        {loggedUser._id === post.author && (
                          <div className="relative">
                            <button
                              onClick={() => setDropdownOpen(post._id === dropdownOpen ? null : post._id)}
                              className="flex items-center text-blue-600 hover:bg-blue-100 px-3 py-1 rounded"
                            >
                              <span className="mr-1">⚙️</span> Actions
                            </button>
                            {dropdownOpen === post._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                                <button
                                  onClick={() => handleDeletePost(post._id)}
                                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 rounded-t-lg"
                                >
                                  Delete Post
                                </button>
                                <button
                                  onClick={() => startEditPost(post)}
                                  className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-b-lg"
                                >
                                  Edit Post
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {showCommentBox[post._id] && (
                        <div className="mt-4">
                          <textarea
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="Write a comment..."
                            rows="3"
                            value={commentText[post._id] || ""}
                            onChange={(e) =>
                              setCommentText({
                                ...commentText,
                                [post._id]: e.target.value,
                              })
                            }
                          />
                          <div className="flex items-center mt-2">
                            <label className="flex items-center text-blue-600 cursor-pointer">
                              <span className="mr-1">📷 Image/GIF</span>
                              <input
                                type="file"
                                accept="image/*,image/gif"
                                onChange={(e) => handleCommentMediaChange(e, post._id)}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {commentPreview[post._id] && (
                            <img
                              src={commentPreview[post._id]}
                              alt="Comment Preview"
                              className="mt-3 w-full max-h-48 object-cover rounded"
                            />
                          )}
                          <button
                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            onClick={() => handleCommentSubmit(post._id)}
                            disabled={loading}
                          >
                            {loading ? "Posting..." : "Post Comment"}
                          </button>
                        </div>
                      )}
                      <div className="mt-4 bg-gray-50 p-4 rounded">
                        <h4 className="text-blue-600 font-semibold mb-2">Comments</h4>
                        {post.comments?.map((comment) => {
                          console.log("Comment:", comment);
                          const commentAuthor = users.find((u) => u._id === comment.authorId) || {
                            fullname: comment.author || "Anonymous",
                            username: "anonymous",
                            image_user: null,
                          };
                          console.log("Comment Author:", commentAuthor);
                          return (
                            <div key={comment._id} className="flex mb-4">
                              <img
                                src={getImageUrl(commentAuthor)}
                                alt={comment.author}
                                className="w-8 h-8 rounded-full mr-3 mt-2"
                              />
                              <div className="flex-1 bg-white shadow-sm rounded-lg p-2">
                                <div className="flex items-center mb-1">
                                  <h4 className="font-semibold text-sm mr-2">{commentAuthor.username}</h4>
                                  <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
                                </div>
                                {editCommentId === comment._id ? (
                                  <div>
                                    <textarea
                                      className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                      rows="3"
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                    />
                                    <div className="flex items-center mt-2">
                                      <label className="flex items-center text-blue-600 cursor-pointer">
                                        <span className="mr-1">📷 Image/GIF</span>
                                        <input
                                          type="file"
                                          accept="image/*,image/gif"
                                          onChange={handleEditCommentMediaChange}
                                          className="hidden"
                                        />
                                      </label>
                                    </div>
                                    {editCommentPreview && (
                                      <img
                                        src={editCommentPreview}
                                        alt="Edit Comment Preview"
                                        className="mt-3 w-full max-h-48 object-cover rounded"
                                      />
                                    )}
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={() => handleEditComment(post._id, comment._id)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                                        disabled={loading}
                                      >
                                        {loading ? "Saving..." : "Save"}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditCommentId(null);
                                          setEditCommentText("");
                                          setEditCommentMedia(null);
                                          setEditCommentPreview(null);
                                        }}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-gray-600 m-1">{comment.text}</p>
                                    {comment.media && (
                                      <img
                                        src={`http://localhost:5000/uploads/${comment.media}`}
                                        alt="Comment media"
                                        className="mt-2 w-full max-h-48 object-cover rounded"
                                      />
                                    )}
                                    {comment.author === loggedUser.fullname && (
                                      <div className="flex justify-end mt-2 space-x-2">
                                        <button
                                          onClick={() => handleDeleteComment(post._id, comment._id)}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          Delete
                                        </button>
                                        <button
                                          onClick={() => startEditComment(comment)}
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          Edit
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {commentPagination[post._id]?.totalPages > 1 && (
                          <div className="flex justify-center gap-2 mt-4">
                            <button
                              onClick={() =>
                                handleCommentPageChange(post._id, commentPagination[post._id].currentPage - 1)
                              }
                              disabled={commentPagination[post._id]?.currentPage <= 1}
                              className="px-3 py-1 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-50"
                            >
                              Previous
                            </button>
                            {Array.from(
                              { length: commentPagination[post._id]?.totalPages || 1 },
                              (_, i) => i + 1
                            ).map((page) => (
                              <button
                                key={page}
                                onClick={() => handleCommentPageChange(post._id, page)}
                                className={`px-3 py-1 rounded ${
                                  commentPagination[post._id]?.currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "text-blue-600 hover:bg-blue-100"
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                            <button
                              onClick={() =>
                                handleCommentPageChange(post._id, commentPagination[post._id].currentPage + 1)
                              }
                              disabled={
                                commentPagination[post._id]?.currentPage >=
                                commentPagination[post._id]?.totalPages
                              }
                              className="px-3 py-1 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* All Posts */}
            {loading && <p className="text-center">Loading posts...</p>}
            {posts.map((post) => {
              const authorObj = users.find((u) => u._id === post.author) || {
                fullname: "Anonymous",
                username: "anonymous",
              };
              return (
                <div key={post._id} className="bg-white shadow rounded-lg p-6 mb-6">
                  <div className="flex items-center mb-3">
                    <img
                      src={getImageUrl(authorObj)}
                      alt={authorObj.fullname}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h3 className="font-semibold">{authorObj.username}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {editPostId === post._id ? (
                    <div className="mb-4">
                      <textarea
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        rows="4"
                        value={editPostContent}
                        onChange={(e) => setEditPostContent(e.target.value)}
                      />
                      <div className="flex items-center mt-3">
                        <label className="flex items-center text-blue-600 cursor-pointer mr-4">
                          <span className="mr-1">📷 Image/GIF</span>
                          <input
                            type="file"
                            accept="image/*,image/gif"
                            onChange={handleEditPostMediaChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {editPostPreview && (
                        <img
                          src={editPostPreview}
                          alt="Edit Preview"
                          className="mt-3 w-full max-h-64 object-cover rounded"
                        />
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEditPost(post._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => {
                            setEditPostId(null);
                            setEditPostContent("");
                            setEditPostMedia(null);
                            setEditPostPreview(null);
                          }}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-800 mb-4">{post.content}</p>
                      {Array.isArray(post.media) &&
                        post.media.map((m, idx) =>
                          m.endsWith(".mp4") ? (
                            <video
                              key={idx}
                              controls
                              className="w-full max-h-96 object-cover rounded mb-4"
                            >
                              <source
                                src={`http://localhost:5000/uploads/${m}`}
                                type="video/mp4"
                              />
                            </video>
                          ) : (
                            <img
                              key={idx}
                              src={`http://localhost:5000/uploads/${m}`}
                              alt="Post media"
                              className="w-full max-h-96 object-cover rounded mb-4"
                            />
                          )
                        )}
                    </>
                  )}
                  <div className="flex flex-wrap gap-2 items-center mb-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleLike(post._id)}
                        className="flex items-center text-blue-600 hover:bg-blue-100 px-3 py-1 rounded"
                      >
                        <span className="mr-1">👍</span> Like ({post.likedBy?.length || 0})
                      </button>
                      <button
                        onClick={() => handleShare(post)}
                        className="flex items-center text-blue-600 hover:bg-blue-100 px-3 py-1 rounded"
                      >
                        <span className="mr-1">🔗</span> Share
                      </button>
                      <button
                        onClick={() =>
                          setShowCommentBox({
                            ...showCommentBox,
                            [post._id]: !showCommentBox[post._id],
                          })
                        }
                        className="flex items-center text-blue-600 hover:bg-blue-100 px-3 py-1 rounded"
                      >
                        <span className="mr-1">💬</span> Comment
                      </button>
                      <button
                        onClick={() => handleReportPost(post._id)}
                        className="flex items-center text-yellow-600 hover:bg-yellow-100 px-3 py-1 rounded"
                      >
                        <span className="mr-1">⚠️</span> Report
                      </button>
                    </div>
                    {loggedUser._id === post.author && (
                      <div className="relative">
                        <button
                          onClick={() => setDropdownOpen(post._id === dropdownOpen ? null : post._id)}
                          className="flex items-center text-blue-600 hover:bg-blue-100 px-3 py-1 rounded"
                        >
                          <span className="mr-1">⚙️</span> Actions
                        </button>
                        {dropdownOpen === post._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 rounded-t-lg"
                            >
                              Delete Post
                            </button>
                            <button
                              onClick={() => startEditPost(post)}
                              className="block w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-b-lg"
                            >
                              Edit Post
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {showCommentBox[post._id] && (
                    <div className="mt-4">
                      <textarea
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Write a comment..."
                        rows="3"
                        value={commentText[post._id] || ""}
                        onChange={(e) =>
                          setCommentText({
                            ...commentText,
                            [post._id]: e.target.value,
                          })
                        }
                      />
                      <div className="flex items-center mt-2">
                        <label className="flex items-center text-blue-600 cursor-pointer">
                          <span className="mr-1">📷 Image/GIF</span>
                          <input
                            type="file"
                            accept="image/*,image/gif"
                            onChange={(e) => handleCommentMediaChange(e, post._id)}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {commentPreview[post._id] && (
                        <img
                          src={commentPreview[post._id]}
                          alt="Comment Preview"
                          className="mt-3 w-full max-h-48 object-cover rounded"
                        />
                      )}
                      <button
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        onClick={() => handleCommentSubmit(post._id)}
                        disabled={loading}
                      >
                        {loading ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  )}
                  <div className="mt-4 bg-gray-50 p-4 rounded">
                    <h4 className="text-blue-600 font-semibold mb-2">Comments</h4>
                    {post.comments?.map((comment) => {
                      console.log("Comment:", comment);
                      const commentAuthor = users.find((u) => u._id === comment.authorId) || {
                        fullname: comment.author || "Anonymous",
                        username: "anonymous",
                        image_user: null,
                      };
                      console.log("Comment Author:", commentAuthor);
                      return (
                        <div key={comment._id} className="flex mb-4">
                          <img
                            src={getImageUrl(commentAuthor)}
                            alt={comment.author}
                            className="w-8 h-8 rounded-full mr-3 mt-2"
                          />
                          <div className="flex-1 bg-white shadow-sm rounded-lg p-2">
                            <div className="flex items-center mb-1">
                              <h4 className="font-semibold text-sm mr-2">{commentAuthor.username}</h4>
                              <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
                            </div>
                            {editCommentId === comment._id ? (
                              <div>
                                <textarea
                                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                  rows="3"
                                  value={editCommentText}
                                  onChange={(e) => setEditCommentText(e.target.value)}
                                />
                                <div className="flex items-center mt-2">
                                  <label className="flex items-center text-blue-600 cursor-pointer">
                                    <span className="mr-1">📷 Image/GIF</span>
                                    <input
                                      type="file"
                                      accept="image/*,image/gif"
                                      onChange={handleEditCommentMediaChange}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                                {editCommentPreview && (
                                  <img
                                    src={editCommentPreview}
                                    alt="Edit Comment Preview"
                                    className="mt-3 w-full max-h-48 object-cover rounded"
                                  />
                                )}
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => handleEditComment(post._id, comment._id)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                                    disabled={loading}
                                  >
                                    {loading ? "Saving..." : "Save"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditCommentId(null);
                                      setEditCommentText("");
                                      setEditCommentMedia(null);
                                      setEditCommentPreview(null);
                                    }}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-gray-600 m-1">{comment.text}</p>
                                {comment.media && (
                                  <img
                                    src={`http://localhost:5000/uploads/${comment.media}`}
                                    alt="Comment media"
                                    className="mt-2 w-full max-h-48 object-cover rounded"
                                  />
                                )}
                                {comment.author === loggedUser.fullname && (
                                  <div className="flex justify-end mt-2 space-x-2">
                                    <button
                                      onClick={() => handleDeleteComment(post._id, comment._id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      Delete
                                    </button>
                                    <button
                                      onClick={() => startEditComment(comment)}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {commentPagination[post._id]?.totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <button
                          onClick={() =>
                            handleCommentPageChange(post._id, commentPagination[post._id].currentPage - 1)
                          }
                          disabled={commentPagination[post._id]?.currentPage <= 1}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {Array.from(
                          { length: commentPagination[post._id]?.totalPages || 1 },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => handleCommentPageChange(post._id, page)}
                            className={`px-3 py-1 rounded ${
                              commentPagination[post._id]?.currentPage === page
                                ? "bg-blue-600 text-white"
                                : "text-blue-600 hover:bg-blue-100"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() =>
                            handleCommentPageChange(post._id, commentPagination[post._id].currentPage + 1)
                          }
                          disabled={
                            commentPagination[post._id]?.currentPage >=
                            commentPagination[post._id]?.totalPages
                          }
                          className="px-3 py-1 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;