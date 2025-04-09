// controllers/eventController.js

const Event = require('../Models/event');

// Fonction pour ajouter un événement
exports.addEvent = async (req, res) => {
  try {
    console.log("Fichier reçu :", req.file);
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
      eventPicture: req.file ? req.file.buffer.toString("base64") : req.body.eventPicture || null,
    };

    console.log("Données après parsing :", eventData);

    const newEvent = new Event(eventData);
    await newEvent.save();

    res.status(201).json({ message: "Événement ajouté avec succès", event: newEvent });
  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ message: "Erreur interne du serveur", error });
  }
};



// Fonction pour mettre à jour un événement
exports.updateEvent = async (req, res) => {
  console.log("Requête reçue pour update - Body:", req.body);
  console.log("Requête reçue pour update - File:", req.file);
  
  try {
    const updateData = { ...req.body };
    
    // Si une nouvelle image est fournie
    if (req.file) {
      updateData.eventPicture = req.file.buffer.toString('base64');
    }

    // Supprimer les champs MongoDB qui ne doivent pas être modifiés
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    console.log("Données à mettre à jour:", updateData);

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }

    console.log("Événement mis à jour avec succès:", event);
    res.status(200).json(event);
  } catch (error) {
    console.error("Erreur mise à jour :", error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'événement', error });
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
    const event = await Event.findById(req.params.id);
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
    const events = await Event.find();
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
  