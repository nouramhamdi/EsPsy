const express = require("express");
const router = express.Router();
const appointmentController = require("../Controllers/appointmentController");


// Route to create an appointment request (Teacher requests an appointment)

router.post("/createAppointment", appointmentController.createAppointment);
router.post("/getBookedSlots", appointmentController.getBookedSlots);
router.post('/reschedule', appointmentController.rescheduleAppointment);
router.post('/createAppointment', appointmentController.createAppointment);

router.post("/request", appointmentController.requestAppointment);

router.get("/requested", appointmentController.getRequestedAppointments);
router.get('/getUserAppointments/:userId', appointmentController.getUserAppointments);

router.put("/approve/:id", appointmentController.approveAppointment);
// router.delete("/decline/:id", appointmentController.declineAppointment);

router.get("/confirmed", appointmentController.getConfirmedAppointments);
router.put("/update", appointmentController.updateAppointmentDate);
router.delete("/cancel/:id", appointmentController.cancelAppointment);
router.post('/:id/student-feedback',appointmentController.submitStudentFeedback);
router.get("/confirm/:appointmentId", appointmentController.confirmAppointment);

// Add File Patient routes
router.post('/files', appointmentController.createFile);
router.get('/files/psychologist/:id', appointmentController.getFilesByPsychologist);
router.get('/files/:id', appointmentController.getFileById);
router.delete('/files/:id', appointmentController.deleteFile);
router.put('/files/:id/note', appointmentController.updateFileNote);

module.exports = router;