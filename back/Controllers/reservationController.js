const Reservation = require('../Models/reservationModel');
const Event = require('../Models/event');
const { sendReservationConfirmation } = require('../services/emailService');

// Fonction pour ajouter une nouvelle réservation
exports.AjouterReservation = async (req, res) => {
    try {
        console.log('Données de réservation reçues:', req.body);
        
        const { idevent, iduser, Student, class: studentClass, mail } = req.body;

        // Vérifier si l'événement existe
        const event = await Event.findById(idevent);
        if (!event) {
            console.log('Événement non trouvé avec l\'ID:', idevent);
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        console.log('Événement trouvé:', event);

        // Vérifier si l'utilisateur a déjà réservé cet événement
        const existingReservation = await Reservation.findOne({ idevent, iduser });
        if (existingReservation) {
            console.log('Réservation existante trouvée:', existingReservation);
            return res.status(400).json({ message: 'Vous avez déjà réservé cet événement' });
        }

        const newReservation = new Reservation({
            idevent,
            iduser,
            Student,
            class: studentClass,
            mail,
            Event: event.title,
            date: event.date
        });

        await newReservation.save();
        console.log('Nouvelle réservation enregistrée:', newReservation);

        // Générer l'URL du QR code
        const qrCodeContent = `Event Details
Name: ${Student}
Email: ${mail}
Event Title: ${event.title}
Event Date: ${new Date(event.date).toLocaleDateString()}`;
        
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeContent)}`;
        console.log('URL du QR code généré:', qrCodeUrl);

        // Envoyer l'email de confirmation
        try {
            console.log('Tentative d\'envoi d\'email à:', mail);
            const emailSent = await sendReservationConfirmation(mail, event, qrCodeUrl);
            
            if (!emailSent) {
                console.error('Échec de l\'envoi de l\'email');
                // On continue quand même car la réservation est créée
            } else {
                console.log('Email envoyé avec succès');
            }
        } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email:', emailError);
            // On continue quand même car la réservation est créée
        }

        res.status(201).json({ 
            message: 'Réservation effectuée avec succès',
            reservation: newReservation,
            qrCodeUrl
        });
    } catch (error) {
        console.error('Erreur détaillée lors de la réservation:', error);
        res.status(500).json({ message: 'Erreur lors de la réservation', error: error.message });
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

// Fonction pour récupérer les réservations d'un événement spécifique
exports.getEventReservations = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservations = await Reservation.find({ idevent: id })
      .select('Student mail date')
      .sort({ createdAt: -1 });

    res.status(200).json(reservations);
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des réservations",
      error: error.message
    });
  }
};

// Fonction pour récupérer les réservations d'un utilisateur spécifique
exports.getUserReservations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const reservations = await Reservation.find({ iduser: userId })
      .populate('idevent', 'title date eventType')
      .sort({ date: -1 });

    if (!reservations || reservations.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(reservations);
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des réservations",
      error: error.message
    });
  }
};

// Fonction pour annuler une réservation
exports.cancelReservation = async (req, res) => {
  try {
    const { eventId, userId } = req.params;

    // Vérifier si la réservation existe
    const reservation = await Reservation.findOne({
      idevent: eventId,
      iduser: userId
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Récupérer l'événement
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Supprimer la réservation
    await Reservation.deleteOne({ _id: reservation._id });

    // Mettre à jour le nombre de participants de l'événement
    event.maxParticipants += 1;
    if (event.status === "Fully booked event") {
      event.status = "active";
    }
    await event.save();

    res.status(200).json({ 
      message: "Reservation cancelled successfully",
      event: event
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({ 
      message: "Error cancelling reservation",
      error: error.message 
    });
  }
};