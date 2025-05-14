const Appointment = require("../Models/Appointment");
const userModel = require("../Models/userModel");
const nodemailer = require("nodemailer");
const twilio = require('twilio');
const cron = require('node-cron');
const FilePatient = require('../Models/FilePatient');



// Controller function to handle appointment request creation
module.exports.requestAppointment = async (req, res) => {
  try {
    const { student, psychologist,  description } = req.body;

    // Validate required fields
    if (!student || !psychologist ||  !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create new appointment request
    const newAppointment = new Appointment({
      student,
      psychologist,
      description,
      status: "requested", 
    });

    await newAppointment.save();
    res.status(201).json({ message: "Appointment request submitted successfully.", appointment: newAppointment });

  } catch (error) {
    res.status(500).json({ message: "Error creating appointment", error });
  }
};

// Get all requested (pending) appointments
module.exports.getRequestedAppointments = async (req, res) => {
    try {
      const requestedAppointments = await Appointment.find({ status: "requested" })
        .populate("student", "fullname email")
        .populate("psychologist", "fullname email")
      
      res.json(requestedAppointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching requested appointments", error });
    }
  };

  module.exports.getConfirmedAppointments = async (req, res) => {
    try {
      const confirmedAppointments = await Appointment.find({ status: "approved" })
        .populate("student", "fullname email")
        .populate("psychologist", "fullname email")
  
      res.json(confirmedAppointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching confirmed appointments", error });
    }
  };
  
  exports.getUserAppointments = async (req, res) => {
    try {
        const userId = req.params.userId;

        const appointments = await Appointment.find({           
           student: userId             
        })
        .populate('student', 'username email image_user') // Populate student details
        .populate('psychologist', 'username email image_user') // Populate psychologist details
        .sort({ scheduledDate: -1 }); // Sort by most recent first

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No appointments found for this user'
            });
        }

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });

    } catch (error) {
        console.error('Error fetching user appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
  
  
  // Approve an appointment
  module.exports.approveAppointment = async (req, res) => {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findById(id);
      
      if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  
      appointment.status = "approved";
      await appointment.save();
      
      res.json({ message: "Appointment approved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error approving appointment", error });
    }
  };
  

  module.exports.cancelAppointment = async (req, res) => {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findByIdAndUpdate(
        id,
        { status: "cancelled" },
        { new: true }
      );
      
      if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  
      res.json({ message: "Appointment cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error cancelling appointment", error });
    }
  };


  exports.submitStudentFeedback = async (req, res) => {
    try {

       console.log("feedback :",req.body.feedback)
        const appointment = await Appointment.findById(req.params.id)
            .populate('student psychologist', 'name email');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        if (appointment.student._id.toString() !== req.body.feedback.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to submit feedback for this appointment'
            });
        }


        appointment.feedbacks.push(req.body.feedback);
        const updatedAppointment = await appointment.save();

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: updatedAppointment
        });

    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};








module.exports.getAvailableSlots = async (req, res) => {
  try {
    const { psychologistId, date } = req.query; // ID du psychologue et date sélectionnée

    // Trouver le psychologue
    const psychologist = await userModel.findOne({ _id: psychologistId, role: "psychologist" });
    if (!psychologist) {
      return res.status(404).json({ message: "Psychologist not found" });
    }

    // Trouver les disponibilités pour la date sélectionnée
    const availability = psychologist.availability.find((a) => {
      return a.date.toISOString().split("T")[0] === date;
    });

    if (!availability) {
      return res.json({ slots: [] }); // Aucun créneau disponible pour cette date
    }

    // Filtrer les créneaux disponibles (non réservés)
    const availableSlots = availability.slots
      .filter((slot) => !slot.booked) // Ne garder que les créneaux non réservés
      .map((slot) => slot.time); // Retourner uniquement les heures

    res.json({ slots: availableSlots }); // Retourner les créneaux disponibles
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ message: "Error fetching available slots", error });
  }
};
  
 

module.exports.createAppointment = async (req, res) => {
  try {
    const { studentId, psychologistId, date, time } = req.body;

    if (!studentId || !psychologistId || !date || !time) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const scheduledDate = new Date(`${date}`);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date or time format' });
    }

    const psychologist = await userModel.findById(psychologistId);
    if (!psychologist) {
      return res.status(404).json({ error: 'Psychologist not found' });
    }

    const dateKey = new Date(date).toISOString().split('T')[0];
    let availabilityEntry = psychologist.availability.find(
      (av) => av.date.toISOString().split('T')[0] === dateKey
    );

    if (availabilityEntry) {
      // Vérifier si le créneau est déjà réservé
      const slotIndex = availabilityEntry.slots.findIndex(
        (slot) => slot.time === time
      );

      if (slotIndex !== -1) {
        if (availabilityEntry.slots[slotIndex].booked) {
          return res.status(400).json({
            error: 'Slot already booked, select another available time',
          });
        }
        availabilityEntry.slots[slotIndex].booked = true;
      } else {
        availabilityEntry.slots.push({ time, booked: true });
      }
    } else {
      psychologist.availability.push({
        date: new Date(date),
        slots: [{ time, booked: true }],
      });
    }

    // Sauvegarder la disponibilité du psychologue
    await psychologist.save();

    // Créer le nouveau rendez-vous
    const newAppointment = new Appointment({
      student: studentId,
      psychologist: psychologistId,
      scheduledDate,
      time,
      status: 'approved',
    });

    // Sauvegarder le rendez-vous
    await newAppointment.save();

   

    // Réponse de succès
    res.status(201).json({ newAppointment, psychologist });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getBookedSlots = async (req, res) => {
  try {
    const { psychologistId, date } = req.body;

    if (!psychologistId || !date) {
      return res.status(400).json({ error: 'psychologistId and date are required' });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const psychologist = await userModel.findById(psychologistId);
    if (!psychologist) {
      return res.status(404).json({ error: 'Psychologist not found' });
    }

    const dateKey = parsedDate.toISOString().split('T')[0];
    const availabilityEntry = psychologist.availability.find(
      (av) => av.date.toISOString().split('T')[0] === dateKey
    );

    if (!availabilityEntry) {
      return res.status(200).json({ message: 'No availability found for the given date', bookedSlots: [] });
    }

    const bookedSlots = availabilityEntry.slots.filter((slot) => slot.booked);

    res.status(200).json({
      psychologistId,
      date,
      bookedSlots: bookedSlots.map((slot) => slot.time),
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.scheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.scheduledDate = scheduledDate;
    appointment.status = "approved";
    await appointment.save();

    res.json({ message: "Appointment scheduled successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error scheduling appointment", error });
  }
};
//la fct qui permet au psy de planifier le rdv dans son interface psy
module.exports.rescheduleAppointment = async (req, res) => {
  
  try {
    const { appointmentId, psychologistId, newDate, newTime } = req.body;

    if (!appointmentId || !psychologistId || !newDate || !newTime) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const newScheduledDate = new Date(newDate);
    if (isNaN(newScheduledDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const psychologist = await userModel.findById(psychologistId);
    if (!psychologist) {
      return res.status(404).json({ error: 'Psychologist not found' });
    }

    const appointment = await Appointment.findById(appointmentId).populate("student");
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (!appointment.student || !appointment.student.email) {
      return res.status(400).json({ error: "Student email not found" });
    }

    const dateKey = new Date(newDate).toISOString().split('T')[0];
    let availabilityEntry = psychologist.availability.find(
      av => av.date.toISOString().split('T')[0] === dateKey
    );

    if (availabilityEntry) {
      const slotExists = availabilityEntry.slots.some(slot => 
        slot.time === newTime && slot.booked
      );
      if (slotExists) {
        return res.status(400).json({ error: 'Time slot already booked' });
      }
    }

    if (availabilityEntry) {
      availabilityEntry.slots.push({ time: newTime, booked: true });
    } else {
      psychologist.availability.push({
        date: new Date(newDate),
        slots: [{ time: newTime, booked: true }]
      });
    }

    appointment.scheduledDate = newScheduledDate;
    appointment.time = newTime;
    appointment.status = 'pending_confirmation';

    // Commit changes
    await psychologist.save();
    await appointment.save();
    try {
      await this.sendEmail(
        appointment.student.email,
        newDate,
        newTime,
        appointment._id,
        psychologist._id
      );
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Vous pouvez choisir de retourner une erreur ou juste logger le problème
      return res.status(500).json({ 
        message: 'Appointment rescheduled but email failed to send',
        error: emailError.message,
        appointment
      });
    }
    
    
    res.status(200).json({ 
      message: 'Appointment rescheduled successfully',
      appointment,
      psychologist
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateAppointmentDate = async (req, res) => {
  try {
    const { appointmentId, newDate, newTime } = req.body;

    // Vérifier si le rendez-vous existe
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    // Mise à jour de la date et l'heure
    appointment.scheduledDate = newDate;
    appointment.time = newTime;
    await appointment.save();

    res.status(200).json({ message: "Rendez-vous mis à jour avec succès", appointment });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};





module.exports.sendEmail = async (studentEmail, date, time, appointmentId, psychologistId) => {
  const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          user: "espsytunisia@gmail.com",  // Use a proper email here
        pass: "isae zjyl bkjm aiyv"  
      },
    });
  try {
    const subject = "Appointment Confirmation Request";
    const confirmationLink = `https://espsy.onrender.com/appointments/confirm/${appointmentId}`;
    const rescheduleLink = `https://espsyy-raniakhedris-projects.vercel.app/app/appointment/${psychologistId}`;
    const htmlBody = `
       <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: #2563eb;">Appointment Confirmation</h2>
        <p>Bonjour,</p>
        <p>Your psychologist has scheduled an appointment for you</p>
        <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('fr-FR')}</p>
        <p><strong>Heure:</strong> ${time}</p>
<p>If this time slot works for you, please confirm your appointment:</p>
        <a href="${confirmationLink}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">Confirm</a>
        <a href="${rescheduleLink}" style="background-color: #FF9800; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Reschedule</a>
        <p>Kind regards,,</p>
        <p>The Support Team</p>
      </div>
    `;

    const mailOptions = {
      from: "espsytunisia@gmail.com",
      to: studentEmail,
      subject: subject,
      html: htmlBody,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email de confirmation envoyé à:", studentEmail);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};

//confi de rdv dans le mail d'etudiant 
exports.confirmAppointment = async (req, res) => {
  console.log("==> confirmAppointment hit");

  try {
    const appointmentId = req.params.appointmentId;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).send(`
        <html>
          <head>
            <title>Appointment Confirmation</title>
            <style>
              body {
                background-color: #fef2f2;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              .card {
                background-color: #fff;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                text-align: center;
              }
              h1 {
                color: #dc2626;
              }
              p {
                color: #555;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>❌ Appointment not found</h1>
              <p>Please check the confirmation link or contact support.</p>
            </div>
          </body>
        </html>
      `);
    }

    appointment.status = "approved";
    await appointment.save();

    res.status(200).send(`
      <html>
        <head>
          <title>Appointment Confirmed</title>
          <style>
            body {
              background-color: #f0fdf4;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background-color: #fff;
              padding: 40px;
              border-radius: 16px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              text-align: center;
              animation: fadeIn 1s ease-in-out;
            }
            h1 {
              color: #16a34a;
              font-size: 28px;
              margin-bottom: 10px;
            }
            p {
              color: #333;
              margin-top: 5px;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>✅ Confirmed successfully!</h1>
            <p>Thank you. You may now close this window.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Erreur serveur : ", error);
    res.status(500).send(`
      <html>
        <head>
          <title>Server Error</title>
          <style>
            body {
              background-color: #fff7ed;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background-color: #fff;
              padding: 40px;
              border-radius: 16px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            h1 {
              color: #ea580c;
            }
            p {
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>⚠️ Server error occurred</h1>
            <p>Please try again later.</p>
          </div>
        </body>
      </html>
    `);
  }
};

const accountSid = 'AC61d32f744343e5ab2f0edd2e8782d981';
const authToken = 'fe1062a116e5f8d347db009e787f8d5c';
const client = twilio(accountSid, authToken);

// Numéro Twilio (celui que Twilio t’a donné)
const twilioNumber = '+17242008469'; // exemple

// module.exports.sendReminderSMS = async (psychologistPhoneNumber, appointmentDate, psychologistName) => {
//   try {
//     const message = `Bonjour ${psychologistName},\nRappel: Vous avez un rendez-vous avec un étudiant prévu à ${appointmentDate}.\nMerci!`;
    
//     await client.messages.create({
//       body: message,
//       from: twilioNumber,
//       to: psychologistPhoneNumber
//     });
    
//     console.log(`Reminder SMS sent to ${psychologistPhoneNumber}`);
//   } catch (error) {
//     console.error(`Failed to send SMS to ${psychologistPhoneNumber}:`, error.message);
//     // Consider adding retry logic or logging to a monitoring system
//   }
// };

module.exports.sendReminderSMS = async (phone, date, name) => {
  try {
    const message = `Bonjour ${name},\nRappel: Rendez-vous à ${date}`;
    console.log("Tentative d'envoi SMS:", { phone, message }); // <-- LOG

    const result = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: phone
    });

    console.log("Réponse Twilio:", result.sid); // <-- LOG
    return true;
  } catch (error) {
    console.error("Erreur Twilio:", error.message); // <-- LOG
    return false;
  }
};

module.exports.checkAppointmentsForReminders = async () => {
  try {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 15 * 60000); // 15 minutes from now
    
    // Find appointments happening in exactly 15 minutes
    const upcomingAppointments = await Appointment.find({
      status: 'approved', // Only confirmed appointments
      scheduledDate: {
        $gte: new Date(reminderTime.getTime() - 120000), // 1 minute buffer
        $lt: new Date(reminderTime.getTime() + 120000) // 1 minute buffer
      }
    }).populate('psychologist', 'number fullname');

    console.log(`Found  appointments for reminders`);
    console.log(`Found ${upcomingAppointments.length} appointments for reminders`);

    for (const appointment of upcomingAppointments) {
      if (appointment.psychologist && appointment.psychologist.number) {
        const formattedDate = appointment.scheduledDate.toLocaleString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        await this.sendReminderSMS(
          appointment.psychologist.number,
          formattedDate,
          appointment.psychologist.fullname
        );
      }
    }
  } catch (error) {
    console.error('Error in checkAppointmentsForReminders:', error);
  }
};

// // Planification de la vérification des rendez-vous toutes les minutes
// cron.schedule('* * * * *', () => {
//   console.log('Vérification des rendez-vous pour envoyer des rappels...');
//   this.checkAppointmentsForReminders()
// });




//file patient 
exports.createFile = async (req, res) => {
  try {
    const { user, psychologist, note } = req.body;

    const newFile = await FilePatient.create({ user, psychologist, note, analysis: ""  });
    
    res.status(201).json({
      success: true,
      data: newFile
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get files by psychologist ID
exports.getFilesByPsychologist = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const files = await FilePatient.find({ psychologist: req.params.id })
      .populate('user', 'fullname username email number')
      .select('note analysis createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFileById = async (req, res) => {
  try {
    const file = await FilePatient.findById(req.params.id)
    .populate('user', 'fullname username email number')

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.status(200).json({
      success: true,
      data: file
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await FilePatient.findByIdAndDelete(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.status(204).json({
      success: true,
      data: null
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { note } = req.body;

    const file = await FilePatient.findOneAndUpdate(
      { _id: req.params.id, 'notes._id': noteId },
      { $set: { 'notes.$.note': note } },
      { new: true, runValidators: true }
    ).populate('user', 'fullname username email number');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File or note not found'
      });
    }

    res.status(200).json({
      success: true,
      data: file
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.addNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ error: 'Note text is required' });
    }

    // First find the document
    const filePatient = await FilePatient.findById(req.params.id);
    
    if (!filePatient) {
      return res.status(404).json({ error: 'File patient not found' });
    }

    // Add the new note
    filePatient.notes.push({ note });
    
    // Save the document
    const updated = await filePatient.save();

    // Return the newly added note (last one in the array)
    const newNote = updated.notes[updated.notes.length - 1];
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addRecommendation = async (req, res) => {
  try {
    const { filePatientId } = req.params;
    const { recommendation } = req.body;

    if (!recommendation) {
      return res.status(400).json({ error: 'Recommendation text is required' });
    }

    const updated = await FilePatient.findByIdAndUpdate(
      req.params.id,
      { $push: { recommendations: { recommendation } } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'File patient not found' });
    }

    res.status(201).json(updated.recommendations[updated.recommendations.length - 1]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const { filePatientId } = req.params;
    const filePatient = await FilePatient.findById(filePatientId).select('notes');

    if (!filePatient) {
      return res.status(404).json({ error: 'File patient not found' });
    }

    res.status(200).json(filePatient.notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recommendations list
exports.getRecommendations = async (req, res) => {
  try {
    const { filePatientId } = req.params;
    const filePatient = await FilePatient.findById(filePatientId).select('recommendations');

    if (!filePatient) {
      return res.status(404).json({ error: 'File patient not found' });
    }

    res.status(200).json(filePatient.recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// module.exports.getUserByID = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await User.findById(id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({ user });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
exports.getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
