const express = require('express');
const router = express.Router();
const responseController = require('../Controllers/ResponseController');

// Route pour ajouter un résultat à une réponse et envoyer un email
router.put('/add-result/:id', responseController.addResult);

// Autres routes si besoin (ex : getAll, delete, etc.)

module.exports = router;
