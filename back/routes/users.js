var express = require('express');
var router = express.Router();
const userController = require("../Controllers/userController");
const upload = require("../middlewares/uploadFile")
const {requireAuthUser} = require('../middlewares/authMiddlewares')
const userModel = require("../Models/userModel"); 
const { validateUserInput, handleValidationErrors } = require('../middlewares/validateUserInput');


/* GET users listing. */
router.get('/getAllUser',userController.getUsers );
router.get('/getUserByName/:fullname', userController.getUsersByName);
router.get('/getUserById/:id',userController.getUserByID );
router.get("/pending-requests", userController.getPendingRequests);

//router.get('/getActiveUsersStats',userController.getActiveUsersStats );
router.get('/MailAfterSignUp/:id',userController.MailAfterSignUp );
router.get('/verify-account/:token', userController.verifyAccount);
router.get('/role-stats',userController.getUsersByRole );
router.post('/forgot-password',userController.forgotPassword );
router.post('/reset-password',userController.ResetPassword );

router.post('/contact-admin/:email', userController.CancelRequest);
router.post('/addUser',validateUserInput, handleValidationErrors,userController.addUser );
router.post('/addwithImg',upload.single("image_user"),userController.addUser );

router.delete('/deleteUser/:id',userController.deleteUser );
router.delete("/cancel-request/:id", userController.CancelRequest);


router.put('/updateUserImg/:id',upload.single("image_user"),userController.updateUserImg );
router.put('/updateUser/:id',userController.updateUser );
router.put('/changeRole/:id',userController.changeRole );
router.put('/blockUser/:id',userController.blockUser );
router.put('/unblockUser/:id',userController.unblockUser );
router.put('/updateLastActive/:id',userController.updateLastActive );
router.put('/updatePassword/:id',userController.updateUserPassword );
router.put("/accept-request/:id", userController.AcceptRequest);


router.post('/login',userController.login );
router.post('/logout',userController.logout );

router.get('/session-user', async (req, res) => {
  if (req.session.user) {
    try {
      const user = await userModel.findById(req.session.user._id);

      if (!user) {
        return res.status(404).json({ message: "No user found" });
      }

      res.status(200).json({ user });
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(401).json({ message: "No user logged in" });
  }
});

router.get("/availability/:psychologistId", userController.getPsychologistAvailability);
// In your user routes file

// Route pour évaluer un psychologue
router.post('/:psychologistId/rate', requireAuthUser, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const psychologistId = req.params.psychologistId;
    const studentId = req.user._id;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'La note doit être entre 1 et 5' }); // 400 is a valid status code for bad input
    }

    const psychologist = await userModel.findById(psychologistId);
    if (!psychologist) {
      return res.status(404).json({ message: 'Psychologue non trouvé' }); // 404 for not found
    }

    const existingRatingIndex = psychologist.ratings.findIndex(
      r => r.studentId.toString() === studentId.toString()
    );

    if (existingRatingIndex >= 0) {
      psychologist.ratings[existingRatingIndex].rating = rating;
      psychologist.ratings[existingRatingIndex].comment = comment;
    } else {
      psychologist.ratings.push({ studentId, rating, comment });
    }

    const totalRatings = psychologist.ratings.reduce((sum, r) => sum + r.rating, 0);
    psychologist.averageRating = totalRatings / psychologist.ratings.length;

    await psychologist.save();

    res.status(200).json({ 
      message: 'Évaluation soumise avec succès', 
      averageRating: psychologist.averageRating,
      totalRatings: psychologist.ratings.length
    }); // 200 for success
  } catch (error) {
    console.error('Erreur lors de la soumission de l\'évaluation:', error);
    res.status(500).json({ message: 'Échec de la soumission de l\'évaluation' }); // 500 for server errors
  }
});


// Route pour obtenir les évaluations d'un psychologue
router.get('/:psychologistId/ratings', async (req, res) => {
  try {
    const psychologist = await userModel.findById(req.params.psychologistId)
      .select('ratings averageRating')
      .populate('ratings.studentId', 'fullname');

    if (!psychologist) {
      return res.status(404).json({ message: 'Psychologue non trouvé' });
    }

    res.status(200).json({
      averageRating: psychologist.averageRating,
      totalRatings: psychologist.ratings.length,
      ratings: psychologist.ratings
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des évaluations:', error);
    res.status(500).json({ message: 'Échec de la récupération des évaluations' });
  }
});
router.get('/psychologists', userController.getPsychologists);

router.get('/psychologists/stats', userController.getPsychologistStats);
router.get('/stats/test-participation', userController.getTestParticipationStats);

module.exports = router;