const express = require("express");
const multer = require("multer");
const path = require("path");
const { addResource, getResources, deleteResource, updateResource, getResourceById, searchResources , toggleBlockResource , getMostLikedResourcesByType , getResourceStatsByType} = require("../Controllers/resourceController");

const router = express.Router();
const Resource = require("../Models/resourceModel");
const mongoose = require("mongoose");
// Middleware d'authentification simple
const checkAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Vous devez être connecté" });
  }
  next();
};

// Configuration de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'public/uploads/';
    if (file.mimetype.startsWith('image/')) uploadPath += 'images/';
    else if (file.mimetype.startsWith('video/')) uploadPath += 'videos/';
    else if (file.mimetype.startsWith('audio/')) uploadPath += 'audios/';
    else if (file.mimetype === 'application/pdf') uploadPath += 'pdfs/';
    
    // Créer le dossier s'il n'existe pas
    require('fs').mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image': ['image/jpeg', 'image/png', 'image/gif'],
    'video': ['video/mp4', 'video/mpeg', 'video/quicktime'],
    'audio': ['audio/mpeg', 'audio/wav', 'audio/mp3'],
    'pdf': ['application/pdf']
  };

  const isAllowed = Object.values(allowedTypes).flat().includes(file.mimetype);
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: "Erreur lors de l'upload du fichier" });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Routes protégées
router.get('/search', searchResources);
router.get('/getAllResources', getResources);
router.post("/addResource", upload.array('files', 10), handleUploadError, addResource);
router.delete('/deleteResource/:id', deleteResource);
router.put('/updateResource/:id', upload.array('files', 10), handleUploadError, updateResource);
router.get('/getResourceById/:id', getResourceById);
router.post('/BlockResource/:id', toggleBlockResource);
router.get("/stats/most-liked-by-type", getMostLikedResourcesByType)
router.get("/stats/resource-stats-by-type", getResourceStatsByType)

// Routes pour les likes et favoris
router.post("/:id/like", checkAuth, async (req, res) => {
  try {
    // Validate resource ID format
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid resource ID" });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: "Resource not found" });

    // Convert user ID to ObjectId
    const userId = new mongoose.Types.ObjectId(req.body.userId);

    // Check existing likes using Mongoose-friendly comparison
    const isLiked = resource.likes.some(id => id.equals(userId));

    if (isLiked) {
      // Remove like
      resource.likes = resource.likes.filter(id => !id.equals(userId));
      resource.likesCount = Math.max(0, resource.likesCount - 1);
    } else {
      // Add like
      resource.likes.push(userId);
      resource.likesCount = resource.likesCount + 1;
    }

    await resource.save();
    
    res.json({
      likes: resource.likesCount,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/favorite", checkAuth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    const userId = new mongoose.Types.ObjectId(req.body.userId);
    const isFavorited = resource.favorites.some(id => id.equals(userId));

    if (isFavorited) {
      // Remove from favorites
      resource.favorites = resource.favorites.filter(id => !id.equals(userId));
      resource.favoritesCount = Math.max(0, resource.favoritesCount - 1);
    } else {
      // Add to favorites
      resource.favorites.push(userId);
      resource.favoritesCount = resource.favoritesCount + 1;
    }

    await resource.save();
    res.json({ 
      favorites: resource.favoritesCount,
      isFavorited: !isFavorited 
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route pour obtenir les favoris d'un utilisateur
router.get("/favorites", checkAuth, async (req, res) => {
  try {
    if (!req.session.user || !req.session.user._id) {
      return res.status(401).json({ error: "Vous devez être connecté" });
    }

    const userId = req.session.user._id;
    const favorites = await Resource.find({
      favorites: userId
    }).populate('createdBy', 'username');
    
    res.json(favorites);
  } catch (error) {
    console.error("Error getting favorites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/translate', async (req, res) => {
  // Implementation of the translate route
});

module.exports = router;