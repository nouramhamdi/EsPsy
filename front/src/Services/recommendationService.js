import axios from 'axios';
import { OPENAI_API_KEY, OPENAI_API_URL } from '../Configuration/api';

export const getEventRecommendations = (events, reservations) => {
  console.log("Début de getEventRecommendations");
  console.log("Nombre d'événements reçus:", events.length);
  console.log("Nombre de réservations reçues:", reservations.length);

  // Si pas de réservations, retourner tous les événements non réservés
  if (!reservations || reservations.length === 0) {
    console.log("Aucune réservation trouvée, retour de tous les événements");
    return events;
  }

  // Créer un Set des IDs des événements réservés
  const reservedEventIds = new Set(reservations.map(r => r.idevent?._id || r.idevent));
  console.log("IDs des événements réservés:", Array.from(reservedEventIds));

  // Compter les types d'événements réservés
  const eventTypeCounts = {};
  reservations.forEach(reservation => {
    const eventType = reservation.idevent?.eventType;
    if (eventType) {
      eventTypeCounts[eventType] = (eventTypeCounts[eventType] || 0) + 1;
    }
  });
  console.log("Comptage des types d'événements:", eventTypeCounts);

  // Trouver le type d'événement le plus réservé
  let mostReservedType = '';
  let maxCount = 0;
  for (const [type, count] of Object.entries(eventTypeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostReservedType = type;
    }
  }
  console.log("Type d'événement le plus réservé:", mostReservedType, "avec", maxCount, "réservations");

  // Filtrer tous les événements non réservés
  const unreservedEvents = events.filter(event => !reservedEventIds.has(event._id));
  console.log("Événements non réservés trouvés:", unreservedEvents);

  // Trier les événements non réservés en mettant ceux du type le plus réservé en premier
  const sortedRecommendations = unreservedEvents.sort((a, b) => {
    if (a.eventType === mostReservedType && b.eventType !== mostReservedType) {
      return -1; // a vient avant b
    }
    if (a.eventType !== mostReservedType && b.eventType === mostReservedType) {
      return 1; // b vient avant a
    }
    return 0; // ordre inchangé
  });

  console.log("Événements recommandés triés:", sortedRecommendations);
  return sortedRecommendations;
}; 