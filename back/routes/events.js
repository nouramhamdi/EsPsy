// routes/events.js

const express = require("express");
const router = express.Router();
const eventController = require("../Controllers/eventController");
const multer = require("multer");
const Event = require("../Models/event");

// Configuration de multer pour stocker l'image en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route pour obtenir les statistiques des événements
router.get('/statistics', eventController.getEventStatistics);

// Route pour ajouter un événement avec une image
router.post("/add", upload.single("eventPicture"), eventController.addEvent);

// Route pour mettre à jour un événement
// Middleware personnalisé pour gérer à la fois les données JSON et les formulaires multipart/form-data
const handleUpdateRequest = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('application/json')) {
    // Si la requête est en JSON, passer directement au contrôleur
    return next();
  } else if (contentType.includes('multipart/form-data')) {
    // Si la requête est un formulaire multipart, utiliser le middleware upload
    return upload.single('eventPicture')(req, res, next);
  } else {
    // Pour les autres types de contenu, passer directement
    return next();
  }
};

router.put('/update/:id', handleUpdateRequest, eventController.updateEvent);

// Route pour supprimer un événement
router.delete("/delete/:id", eventController.deleteEvent);

// Route pour récupérer un événement par son id
router.get("/:id", eventController.getOneEvent);

// Route pour récupérer tous les événements
router.get("/", eventController.getAllEvents);

// Route pour rechercher des événements
router.get("/search/:title", eventController.searchEvent);

// Route pour récupérer les événements d'un psychologue spécifique
router.get('/psychologist/:psychologistId', eventController.getPsychologistEvents);

// Route pour mettre à jour le statut d'un événement
router.put('/update-status/:id', eventController.updateEventStatus);

module.exports = router;
