const express = require('express');
const router = express.Router();
const reservationController = require('../Controllers/reservationController');

// Route pour ajouter une réservation
router.post('/ajouter', reservationController.AjouterReservation);

// Route pour afficher toutes les réservations
router.get('/tous', reservationController.AffichertousReservations);

// Route pour vérifier si un utilisateur a déjà réservé un événement
router.get('/check/:eventId/:userId', reservationController.checkReservation);

// Route pour récupérer les réservations d'un événement spécifique
router.get('/event/:id', reservationController.getEventReservations);

// Route pour récupérer les réservations d'un utilisateur spécifique
router.get('/user/:userId', reservationController.getUserReservations);

// Route pour annuler une réservation
router.delete('/cancel/:eventId/:userId', reservationController.cancelReservation);

module.exports = router;