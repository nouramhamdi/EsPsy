const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const express = require("express");

// Schéma de la ressource
const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      minlength: [50, "La description doit contenir au moins 50 caractères"],
      maxlength: [500, "La description ne doit pas dépasser 500 caractères"],
      required: true,
    },
    type: {
      type: String,
      enum: ["meditation", "therapy", "well-being"],
      required: true,
    },
    urifiles: [String], // Tableau des fichiers téléchargés
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User"
    },
    createdAt: { type: Date, default: Date.now },
    // Champs pour les likes et favoris
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    likesCount: {
      type: Number,
      default: 0
    },
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    favoritesCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Middleware après l'enregistrement d'une ressource
resourceSchema.post("save", function (doc, next) {
  console.log("New resource was created & saved successfully");
  next();
});

// Modèle Mongoose pour les ressources
const Resource = mongoose.model("Resource", resourceSchema);

// Configuration du répertoire d'upload
const uploadDirs = ['uploads', 'uploads/images', 'uploads/videos', 'uploads/audios', 'uploads/pdfs'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware d'upload (en supposant que vous utilisez `multer` pour l'upload de fichiers)
const multer = require("multer");
const upload = multer({
  dest: 'uploads/', // Dossier où les fichiers seront stockés temporairement
}).single('file'); // 'file' est le champ du formulaire contenant le fichier à télécharger

// Fonction de traitement des fichiers téléchargés en fonction de leur type MIME
const handleFileUpload = (file) => {
  let uploadPath = '';

  if (file.mimetype.startsWith('image/')) {
    uploadPath = 'images/';
  } else if (file.mimetype.startsWith('video/')) {
    uploadPath = 'videos/';
  } else if (file.mimetype.startsWith('audio/')) {
    uploadPath = 'audios/';
  } else if (file.mimetype === 'application/pdf') {
    uploadPath = 'pdfs/';
  } else {
    throw new Error('Unsupported file type');
  }

  const filePath = path.join(__dirname, 'uploads', uploadPath, file.filename);
  return filePath;
};

// Configuration de votre application Express
const app = express();

// Middleware pour servir les fichiers téléchargés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Exemple d'utilisation d'un routeur d'upload
app.post('/upload', upload, (req, res) => {
  try {
    const file = req.file; // Récupère le fichier téléchargé
    if (!file) {
      return res.status(400).send('No file uploaded');
    }

    // Traitement du fichier téléchargé
    const filePath = handleFileUpload(file);

    // Ici, vous pouvez ajouter la logique pour associer le chemin du fichier à la ressource ou à un autre objet de votre base de données

    res.status(200).send({ message: 'File uploaded successfully', filePath });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = Resource;
