const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  },
  debug: true, // Active le mode debug pour voir les détails de la connexion
  logger: true  // Active les logs
});

// Vérifier la configuration de l'email
console.log('Configuration de l\'email:', {
  user: process.env.EMAIL_USER,
  host: 'smtp.gmail.com'
});

// Vérifier la connexion SMTP
transporter.verify(function(error, success) {
  if (error) {
    console.error('Erreur de connexion SMTP:', error);
  } else {
    console.log('Connexion SMTP réussie');
  }
});

const sendReservationConfirmation = async (userEmail, eventDetails, qrCodeUrl) => {


  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Confirmation de réservation - ' + eventDetails.title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="background-color: #1a365d; padding: 20px; border-radius: 8px; color: white; text-align: center;">
          <h1 style="margin: 0;">Confirmation de réservation</h1>
        </div>

        <div style="margin: 20px 0;">
          <h2 style="color: #2d3748;">${eventDetails.title}</h2>
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p style="margin: 5px 0;"><strong>📅 Date :</strong> ${new Date(eventDetails.date).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>📍 Lieu :</strong> ${eventDetails.location}</p>
            <p style="margin: 5px 0;"><strong>👥 Type d'événement :</strong> ${eventDetails.eventType}</p>
            <p style="margin: 5px 0;"><strong>🎯 Public cible :</strong> ${eventDetails.targetAudience}</p>
            <p style="margin: 5px 0;"><strong>👥 Nombre maximum de participants :</strong> ${eventDetails.maxParticipants}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #2d3748;">Description de l'événement :</h3>
            <p style="background-color: #f7fafc; padding: 15px; border-radius: 8px;">${eventDetails.description}</p>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <h3 style="color: #2d3748;">Votre code QR d'accès :</h3>
            <img src="${qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px; border: 1px solid #e2e8f0; padding: 10px; background-color: white;">
            <p style="color: #718096; font-size: 14px;">Présentez ce code QR à l'entrée de l'événement</p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #f7fafc; border-radius: 8px; text-align: center;">
            <p style="margin: 0;">Merci de votre participation !</p>
            <p style="margin: 5px 0; color: #718096; font-size: 14px;">Pour toute question, n'hésitez pas à nous contacter.</p>
          </div>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
 
    return false;
  }
};

// Fonction pour envoyer un email de notification d'annulation d'événement
const sendEventCancellationNotification = async (userEmail, eventDetails) => {


  // Vérifier si l'email est valide
  if (!userEmail || !userEmail.includes('@')) {
    console.error('Adresse email invalide:', userEmail);
    return false;
  }

  // Vérifier si les détails de l'événement sont valides
  if (!eventDetails || !eventDetails.title) {
    console.error('Détails de l\'événement invalides:', eventDetails);
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Annulation d\'événement - ' + eventDetails.title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="background-color: #e53e3e; padding: 20px; border-radius: 8px; color: white; text-align: center;">
          <h1 style="margin: 0;">Annulation d'événement</h1>
        </div>

        <div style="margin: 20px 0;">
          <p style="font-size: 16px; line-height: 1.5;">Cher(e) participant(e),</p>

          <p style="font-size: 16px; line-height: 1.5;">Nous regrettons de vous informer que l'événement suivant a été annulé :</p>

          <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h2 style="color: #2d3748; margin-top: 0;">${eventDetails.title}</h2>
            <p style="margin: 5px 0;"><strong>📅 Date :</strong> ${new Date(eventDetails.date).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>📍 Lieu :</strong> ${eventDetails.location}</p>
            <p style="margin: 5px 0;"><strong>👥 Type d'événement :</strong> ${eventDetails.eventType}</p>
          </div>

          <p style="font-size: 16px; line-height: 1.5;">Nous nous excusons pour tout inconvénient que cette annulation pourrait causer. Si vous avez des questions ou des préoccupations, n'hésitez pas à nous contacter.</p>

          <p style="font-size: 16px; line-height: 1.5;">Nous espérons vous voir à nos futurs événements.</p>

          <div style="margin-top: 20px; padding: 15px; background-color: #f7fafc; border-radius: 8px; text-align: center;">
            <p style="margin: 0;">Merci de votre compréhension.</p>
            <p style="margin: 5px 0; color: #718096; font-size: 14px;">L'équipe EsPsy</p>
          </div>
        </div>
      </div>
    `
  };

  try {
   
    const info = await transporter.sendMail(mailOptions);

   
    return true;
  } catch (error) {
   

    if (error.response) {
      console.error('- Réponse du serveur SMTP:', error.response);
    }

    return false;
  }
};

module.exports = {
  sendReservationConfirmation,
  sendEventCancellationNotification
};