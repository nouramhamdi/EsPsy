const Reservation = require('../Models/reservationModel');
const Event = require('../Models/event');

// Fonction pour ajouter une nouvelle réservation
exports.AjouterReservation = async (req, res) => {
    try {
        // Vérifier si l'événement existe
        const event = await Event.findById(req.body.idevent);
        if (!event) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }

        // Créer une nouvelle réservation
        const reservation = new Reservation({
            idevent: req.body.idevent,
            iduser: req.body.iduser,
            Student: req.body.Student,
            class: req.body.class,
            mail: req.body.mail,
            Event: event.title,  // Sera automatiquement mis à jour par le middleware
            date: event.date    // Sera automatiquement mis à jour par le middleware
        });

        // Sauvegarder la réservation
        const savedReservation = await reservation.save();
        
        res.status(201).json({
            message: "Réservation créée avec succès",
            reservation: savedReservation
        });

    } catch (error) {
        res.status(500).json({
            message: "Erreur lors de la création de la réservation",
            error: error.message
        });
    }
};

// Fonction pour vérifier si un utilisateur a déjà réservé un événement
exports.checkReservation = async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    
    const existingReservation = await Reservation.findOne({
      idevent: eventId,
      iduser: userId
    });

    res.status(200).json({
      hasReservation: !!existingReservation
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de la réservation:", error);
    res.status(500).json({
      message: "Erreur lors de la vérification de la réservation",
      error: error.message
    });
  }
};

// Fonction pour afficher toutes les réservations
exports.AffichertousReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate('idevent', 'title date')  // Récupère les détails de l'événement
            .populate('iduser', 'name email');  // Récupère les détails de l'utilisateur

        res.status(200).json({
            message: "Liste des réservations récupérée avec succès",
            reservations: reservations
        });

    } catch (error) {
        res.status(500).json({
            message: "Erreur lors de la récupération des réservations",
            error: error.message
        });
    }
};