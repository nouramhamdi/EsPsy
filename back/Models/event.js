// models/event.js

const mongoose = require('mongoose');

// Définition du schéma de l'événement
const eventSchema = new mongoose.Schema({
  id_organizer: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  eventType: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  maxParticipants: { type: Number, required: true },
  targetAudience: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'cancelled'], default: 'active' },
  eventPicture: { type: String, required: false },
  eventPictureIsUrl: { type: Boolean, default: false }, // Indique si eventPicture est une URL ou une image en base64
  psychologistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Création du modèle de l'événement
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
