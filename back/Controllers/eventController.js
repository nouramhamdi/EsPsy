// controllers/eventController.js

const Event = require('../Models/event');
const User = require('../Models/userModel');
const Reservation = require('../Models/reservationModel');

// Fonction pour ajouter un événement
exports.addEvent = async (req, res) => {
  try {
    console.log("Fichier reçu :", req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : "Aucun fichier");
    console.log("Données reçues AVANT parsing :", req.body);

    // Vérifie que req.body est bien rempli
    const eventData = {
      id_organizer: req.body.id_organizer || "UNKNOWN", // Évite que ce champ soit vide
      title: req.body.title,
      description: req.body.description,
      eventType: req.body.eventType,
      date: req.body.date,
      location: req.body.location,
      maxParticipants: req.body.maxParticipants,
      targetAudience: req.body.targetAudience,
      status: req.body.status,
      psychologistId: req.body.psychologistId // Ajout de l'ID du psychologue
    };

    // Vérifier si une image générée par IA a été fournie
    if (req.body.eventPictureUrl && req.body.eventPictureSource === 'ai') {
      try {
        console.log("Image générée par IA détectée");

        // Vérifier si c'est une URL ou une image en base64
        if (req.body.eventPictureUrl.startsWith('data:image')) {
          // C'est une image en base64
          console.log("Image base64 détectée");

          // Extraire la partie base64 de l'URL data
          const base64Data = req.body.eventPictureUrl.split(',')[1];
          if (base64Data) {
            eventData.eventPicture = base64Data;
            eventData.eventPictureIsUrl = false;
            console.log("Image base64 ajoutée à l'événement");
          } else {
            // Si l'extraction échoue, utiliser une image de secours
            console.log("Extraction de base64 échouée, utilisation d'une image de secours");
            eventData.eventPicture = 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg';
            eventData.eventPictureIsUrl = true;
          }
        }
        // Vérifier si c'est une URL HTTP/HTTPS
        else if (req.body.eventPictureUrl.startsWith('http') || req.body.eventPictureUrl.startsWith('https')) {
          // Stocker l'URL directement dans le champ eventPicture
          eventData.eventPicture = req.body.eventPictureUrl;
          eventData.eventPictureIsUrl = true; // Indiquer que c'est une URL et non une image en base64

          console.log("URL d'image ajoutée à l'événement");
        } else {
          // Si ce n'est ni une URL ni une image en base64, utiliser une image de secours
          console.log("Format d'image non reconnu, utilisation d'une image de secours");
          eventData.eventPicture = 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg';
          eventData.eventPictureIsUrl = true;
        }

        // Ajouter des logs pour le débogage
        console.log("Données de l'événement avec image:", {
          ...eventData,
          eventPicture: eventData.eventPicture ? "Image ajoutée (non affichée dans les logs)" : null,
          eventPictureIsUrl: eventData.eventPictureIsUrl
        });
      } catch (error) {
        console.error("Erreur lors du traitement de l'image:", error);
        // En cas d'erreur, utiliser une image de secours
        eventData.eventPicture = 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg';
        eventData.eventPictureIsUrl = true;
      }
    }
    // Sinon, vérifier si un fichier image a été fourni
    else if (req.file) {
      try {
        // Vérifier si l'image est une image générée par IA (le nom du fichier commence par "ai-generated-")
        const isAIGenerated = req.file.originalname && req.file.originalname.startsWith('ai-generated-');
        if (isAIGenerated) {
          console.log("Image générée par IA détectée:", req.file.originalname);
        }

        // Vérifier que le buffer contient bien une image valide
        const uint8Array = new Uint8Array(req.file.buffer);
        const isJpeg = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF;
        const isPng = uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47;

        if (isJpeg || isPng) {
          // Convertir l'image en base64 pour le stockage
          eventData.eventPicture = req.file.buffer.toString("base64");
          eventData.eventPictureIsUrl = false; // Indiquer que c'est une image en base64 et non une URL
          console.log("Image valide ajoutée à l'événement, taille:", req.file.size, "bytes");
        } else {
          console.log("Le fichier ne semble pas être une image valide (JPEG/PNG)");
          // Ne pas ajouter l'image si elle n'est pas valide
        }
      } catch (error) {
        console.error("Erreur lors du traitement de l'image:", error);
        // Ne pas ajouter l'image en cas d'erreur
      }
    } else {
      console.log("Aucune image n'a été fournie pour cet événement");

      // Si aucune image n'est fournie, utiliser une image par défaut basée sur le type d'événement
      try {
        const defaultImageUrls = {
          'Workshop': 'https://source.unsplash.com/800x600/?workshop,teamwork',
          'Therapy Session': 'https://source.unsplash.com/800x600/?therapy,calm',
          'Seminar': 'https://source.unsplash.com/800x600/?seminar,conference',
          'Social Event': 'https://source.unsplash.com/800x600/?social,gathering',
          'Support Group': 'https://source.unsplash.com/800x600/?support,group'
        };

        // Utiliser une image par défaut si le type d'événement est reconnu
        if (eventData.eventType && defaultImageUrls[eventData.eventType]) {
          eventData.eventPicture = defaultImageUrls[eventData.eventType];
          eventData.eventPictureIsUrl = true;
          console.log("Image par défaut ajoutée pour le type d'événement:", eventData.eventType);
        }
      } catch (error) {
        console.error("Erreur lors de la génération de l'image par défaut:", error);
      }
    }

    console.log("Données après parsing :", {
      ...eventData,
      eventPicture: eventData.eventPicture ? "Image en base64 (non affichée)" : null
    });

    const newEvent = new Event(eventData);
    await newEvent.save();

    res.status(201).json({
      message: "Événement ajouté avec succès",
      event: {
        ...newEvent._doc,
        eventPicture: newEvent.eventPicture ? "Image en base64 (non affichée dans la réponse)" : null
      },
      imageSource: req.file ? (req.file.originalname.startsWith('ai-generated-') ? 'ai' : 'upload') : 'none'
    });
  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ message: "Erreur lors de l'ajout de l'événement", error: error.message });
  }
};

// Fonction pour mettre à jour un événement
exports.updateEvent = async (req, res) => {
  try {
    // DEBUG: affiche les données reçues
    console.log('BODY:', req.body);
    console.log('Content-Type:', req.headers['content-type']);

    if (req.file) {
      console.log('FILE:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    }

    // Récupère les champs à mettre à jour
    const updateFields = {
      title: req.body.title,
      description: req.body.description,
      eventType: req.body.eventType,
      date: req.body.date,
      location: req.body.location,
      maxParticipants: req.body.maxParticipants,
      targetAudience: req.body.targetAudience,
      status: req.body.status,
    };

    // Si une nouvelle image a été uploadée via multipart/form-data
    if (req.file) {
      try {
        // Vérifier si l'image est une image générée par IA
        const isAIGenerated = req.file.originalname && req.file.originalname.startsWith('ai-generated-');
        if (isAIGenerated) {
          console.log("Image générée par IA détectée lors de la mise à jour:", req.file.originalname);
        }

        // Vérifier que le buffer contient bien une image valide
        const uint8Array = new Uint8Array(req.file.buffer);
        const isJpeg = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF;
        const isPng = uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47;

        if (isJpeg || isPng) {
          // Stocker l'image en base64
          updateFields.eventPicture = req.file.buffer.toString("base64");
          console.log("Image valide mise à jour, taille:", req.file.size, "bytes");
        } else {
          console.log("Le fichier ne semble pas être une image valide (JPEG/PNG)");
          // Ne pas mettre à jour l'image si elle n'est pas valide
        }
      } catch (error) {
        console.error("Erreur lors du traitement de l'image:", error);
        // Ne pas mettre à jour l'image en cas d'erreur
      }
    }
    // Si l'image est fournie dans le corps JSON (pour les requêtes application/json)
    else if (req.body.eventPicture && typeof req.body.eventPicture === 'string') {
      // Si l'image est déjà en base64 ou une URL, la conserver telle quelle
      updateFields.eventPicture = req.body.eventPicture;
      console.log("Image fournie dans le corps JSON conservée");
    }

    // Filtre les champs undefined
    Object.keys(updateFields).forEach(
      key => updateFields[key] === undefined && delete updateFields[key]
    );

    console.log("Champs à mettre à jour:", Object.keys(updateFields));

    // Mets à jour l'événement
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    // DEBUG: affiche l'événement mis à jour (sans l'image pour éviter de surcharger les logs)
    console.log('UPDATED EVENT:', {
      ...updatedEvent._doc,
      eventPicture: updatedEvent.eventPicture ? "Image en base64 (non affichée)" : null
    });

    res.status(200).json({
      ...updatedEvent._doc,
      eventPicture: updatedEvent.eventPicture ? updatedEvent.eventPicture : null,
      imageSource: req.file ? (req.file.originalname.startsWith('ai-generated-') ? 'ai' : 'upload') : 'unchanged'
    });
  } catch (err) {
    console.error('UPDATE ERROR:', err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Fonction pour supprimer un événement
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    res.status(200).json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement', error });
  }
};

// Fonction pour récupérer un événement par son id
exports.getOneEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('psychologistId', 'username');
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'événement', error });
  }
};

// Fonction pour récupérer tous les événements
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('psychologistId', 'username');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des événements', error });
  }
};

// Fonction pour rechercher des événements
exports.searchEvent = async (req, res) => {
    try {
      const { title } = req.params;

      if (!title) {
        return res.status(400).json({ message: "Le titre est obligatoire" });
      }

      const events = await Event.find({ title: new RegExp(title, "i") });
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la recherche des événements", error });
    }
  };

// Fonction pour récupérer les événements d'un psychologue spécifique
exports.getPsychologistEvents = async (req, res) => {
  try {
    const { psychologistId } = req.params;
    const events = await Event.find({ psychologistId: psychologistId }).populate('psychologistId', 'username');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des événements",
      error: error.message
    });
  }
};

// Fonction pour mettre à jour le statut d'un événement
exports.updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Vérifier si l'événement existe
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Si l'événement est annulé, envoyer des emails aux étudiants qui ont réservé
    if (status === 'cancelled') {
      try {
        console.log("=== DÉBUT DU PROCESSUS D'ANNULATION D'ÉVÉNEMENT ===");
        console.log("ID de l'événement annulé:", id);
        console.log("Titre de l'événement annulé:", event.title);

        // Importer le modèle de réservation et le service d'email
        const { sendEventCancellationNotification } = require('../');

        // Récupérer toutes les réservations pour cet événement
        const reservations = await Reservation.find({ idevent: id });
        console.log(`Trouvé ${reservations.length} réservations pour l'événement annulé`);

        if (reservations.length === 0) {
          console.log("Aucune réservation trouvée pour cet événement, aucun email à envoyer");
        } else {
          console.log("Liste des réservations trouvées:");
          reservations.forEach((reservation, index) => {
            console.log(`${index + 1}. Email: ${reservation.mail}, Étudiant: ${reservation.Student}`);
          });
        }

        // Envoyer un email à chaque étudiant qui a réservé
        for (const reservation of reservations) {
          try {
            console.log(`Préparation de l'envoi d'email à ${reservation.mail}`);

            // Préparer les détails de l'événement pour l'email
            const eventDetails = {
              title: event.title,
              date: event.date,
              location: event.location,
              eventType: event.eventType
            };

            console.log("Détails de l'événement pour l'email:", eventDetails);

            // Envoyer l'email de notification d'annulation
            console.log(`Tentative d'envoi d'email à ${reservation.mail}...`);
            const emailResult = await sendEventCancellationNotification(reservation.mail, eventDetails);

            if (emailResult) {
              console.log(`Email d'annulation envoyé avec succès à ${reservation.mail}`);
            } else {
              console.error(`Échec de l'envoi d'email à ${reservation.mail}`);
            }
          } catch (emailError) {
            console.error(`Erreur lors de l'envoi de l'email à ${reservation.mail}:`, emailError);
            // Continuer avec les autres emails même si un échoue
          }
        }

        console.log("=== FIN DU PROCESSUS D'ANNULATION D'ÉVÉNEMENT ===");
      } catch (notificationError) {
        console.error("Erreur lors de l'envoi des notifications d'annulation:", notificationError);
        console.error("Détails de l'erreur:", notificationError.stack);
        // Ne pas bloquer la mise à jour du statut si les notifications échouent
      }
    }

    // Mettre à jour le statut
    event.status = status;
    await event.save();

    res.status(200).json({ message: "Event status updated successfully", event });
  } catch (error) {
    console.error("Error updating event status:", error);
    res.status(500).json({ message: "Error updating event status", error: error.message });
  }
};

// Fonction pour obtenir les statistiques des événements
exports.getEventStatistics = async (req, res) => {
  try {
    // Récupérer tous les événements
    const events = await Event.find();
    
    // Récupérer toutes les réservations avec les détails des événements
    const reservations = await Reservation.find()
      .populate('idevent', 'title eventType date status');

    // Initialiser les statistiques avec des valeurs par défaut
    const eventTypeStats = {};
    let totalReservations = 0;
    let mostReservedEvent = null;
    let maxReservations = 0;
    let upcomingEvents = 0;
    let pastEvents = 0;
    let activeEvents = 0;
    let totalEvents = events.length || 0;
    let eventsByStatus = {
      active: 0,
      cancelled: 0,
      completed: 0
    };

    const now = new Date();

    // Calculer les statistiques des événements
    if (events && events.length > 0) {
      events.forEach(event => {
        try {
          if (event.date) {
            const eventDate = new Date(event.date);
            
            if (eventDate > now) {
              upcomingEvents++;
            } else {
              pastEvents++;
            }
          }

          // Compter les événements par statut
          if (event.status === 'active') {
            activeEvents++;
            eventsByStatus.active++;
          } else if (event.status === 'cancelled') {
            eventsByStatus.cancelled++;
          } else if (event.status === 'completed') {
            eventsByStatus.completed++;
          }
        } catch (error) {
          console.error("Error processing event:", error);
        }
      });
    }

    // Calculer les statistiques des réservations par type d'événement
    if (reservations && reservations.length > 0) {
      reservations.forEach(reservation => {
        try {
          if (reservation.idevent && reservation.idevent.eventType) {
            const eventType = reservation.idevent.eventType;
            
            // Incrémenter le compteur pour ce type d'événement
            eventTypeStats[eventType] = (eventTypeStats[eventType] || 0) + 1;
            totalReservations++;

            // Mettre à jour l'événement le plus réservé
            if (eventTypeStats[eventType] > maxReservations) {
              maxReservations = eventTypeStats[eventType];
              mostReservedEvent = {
                title: reservation.idevent.title || 'Sans titre',
                type: eventType,
                count: maxReservations
              };
            }
          }
        } catch (error) {
          console.error("Error processing reservation:", error);
        }
      });
    }

    // Convertir les statistiques en tableau pour le frontend
    const eventTypeStatsArray = Object.entries(eventTypeStats).map(([eventType, count]) => ({
      eventType,
      count,
      percentage: totalReservations > 0 ? ((count / totalReservations) * 100).toFixed(1) : 0
    }));

    // Trier les statistiques par nombre de réservations (décroissant)
    eventTypeStatsArray.sort((a, b) => b.count - a.count);

    // Envoyer la réponse
    res.status(200).json({
      eventTypeStats: eventTypeStatsArray,
      totalReservations,
      mostReservedEvent,
      upcomingEvents,
      pastEvents,
      activeEvents,
      totalEvents,
      eventsByStatus,
      summary: {
        mostPopularType: eventTypeStatsArray[0]?.eventType || 'Aucun',
        totalEventTypes: Object.keys(eventTypeStats).length,
        averageReservationsPerType: Object.keys(eventTypeStats).length > 0 
          ? Number((totalReservations / Object.keys(eventTypeStats).length).toFixed(1))
          : 0
      }
    });
  } catch (error) {
    console.error("Error getting event statistics:", error);
    res.status(500).json({
      message: "Error getting event statistics",
      error: error.message
    });
  }
};
