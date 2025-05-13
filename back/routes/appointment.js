const express = require("express");
const router = express.Router();
const appointmentController = require("../Controllers/appointmentController");
const axios = require("axios");
const OLLAMA_API_URL = "http://127.0.0.1:11434/api/generate";
const { getStudentProfile } = require('../Controllers/appointmentController');
const FilePatient = require('../Models/FilePatient');


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
router.put('/files/note/:id', appointmentController.addNote);
router.put('/files/recommendation/:id', appointmentController.addRecommendation);
router.get('/files/:id/note', appointmentController.getNotes);
router.get('/files/:id/recommendation', appointmentController.getRecommendations);
// router.put('/:id/notes/:noteId', auth, updateNote);

router.get("/student-profile/:id", appointmentController.getStudentProfile);





//metiers ai 

const ANALYSIS_SYSTEM_PROMPT = `
You are an expert mental health assistant. A teacher provides a description of a student's emotional or behavioral state. Your job is to analyze the description and determine whether the case is an **emergency** or **not an emergency**.

- An **emergency** might involve self-harm, suicidal thoughts, violent behavior, severe emotional breakdown, or signs of abuse.
- A **non-emergency** could include stress, mild anxiety, feeling distracted, or temporary sadness.

Respond ONLY with one of these two outputs:
1. "EMERGENCY: This student needs immediate attention."
2. "NOT AN EMERGENCY: This case can be monitored or supported over time."
3.**Off-Topic Restriction:** If a user asks about topics unrelated to student case description, reply with: "I'm here to assist the psy about the student case emergency . I can't discuss this topic."

Do NOT provide extra explanation or commentary. Keep the answer short and clear.
`;


router.post("/analyze-student", async (req, res) => {
    try {
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ error: "Description is required" });
        }

        const fullPrompt = `${ANALYSIS_SYSTEM_PROMPT}\n\nTeacher: ${description}\n\nAI:`;

        const response = await axios.post(OLLAMA_API_URL, {
            model: "deepseek-r1:1.5b",
            prompt: fullPrompt,
            stream: false,
        });

        let analysisResult = response.data.response;

        // Trim and sanitize the result if necessary
        analysisResult = analysisResult.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        res.json({ result: analysisResult });
    } catch (error) {
        console.error("Error analyzing student case:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});





// System prompt for psy notes analysis
const PSY_ANALYSIS_PROMPT = `
You are a clinical mental health assistant trained to interpret notes from a psychologist. Given a note describing a student's behavior or mental state, do the following:

1. **Analysis:** Summarize the student's current emotional or psychological condition based on the note.
2. **Recommendations:** Provide 2 to 3 helpful, practical suggestions or coping strategies tailored to the student's condition. These may include:
   - Breathing or mindfulness techniques.
   - Journaling or reflection.
   - Seeking peer or family support.
   - Professional follow-up if necessary.

Respond in a warm and professional tone.

Format:
**Analysis:** ...
**Recommendations:**
- ...
- ...
`;



router.post('/analyze-psy-note', async (req, res) => {
    try {
      const { idFile } = req.body;
  
      // Find the patient file by ID
      const patientFile = await FilePatient.findById(idFile);
      if (!patientFile) {
        return res.status(404).json({ error: "Patient file not found" });
      }
  
      // Check if there are notes available
      if (patientFile.notes.length === 0) {
        return res.status(400).json({ error: "No notes available for analysis" });
      }
  
      // Get the latest note
      const latestNote = patientFile.notes[patientFile.notes.length - 1].note;
  
      // Construct the prompt for AI analysis
      const fullPrompt = `${PSY_ANALYSIS_PROMPT}\n\nNote: ${latestNote}\n\nAnalysis and Recommendations:`;
  
      // Call the Ollama API for analysis
      const response = await axios.post(OLLAMA_API_URL, {
        model: "deepseek-r1:1.5b",
        prompt: fullPrompt,
        stream: false,
      });
  
      let analysisResult = response.data.response;

      // Trim and sanitize the result if necessary
      analysisResult = analysisResult.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  
  
      // Add each recommendation to the patient file
        patientFile.recommendations.push({
          recommendation: analysisResult,
          date: new Date()
        });
      
  
      await patientFile.save();
  
      res.json({ success: true, analysis: analysisResult });
    } catch (error) {
      console.error("Error analyzing psychologist note:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });


module.exports = router;