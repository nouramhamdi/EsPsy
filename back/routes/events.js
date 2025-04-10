// routes/events.js

const express = require("express");
const router = express.Router();
const eventController = require("../Controllers/eventController");
const multer = require("multer");

// Configuration de multer pour stocker l'image en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route pour ajouter un événement avec une image
router.post("/add", upload.single("eventPicture"), eventController.addEvent);

// Route pour mettre à jour un événement
router.put("/update/:id", eventController.updateEvent);

// Route pour supprimer un événement
router.delete("/delete/:id", eventController.deleteEvent);

// Route pour récupérer un événement par son id
router.get("/:id", eventController.getOneEvent);

// Route pour récupérer tous les événements
router.get("/", eventController.getAllEvents);

// Route pour rechercher des événements
router.get("/search/:title", eventController.searchEvent);

module.exports = router;
