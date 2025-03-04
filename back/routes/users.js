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
          res.status(500).json({ message: err.message });
      }
  } 
  else {
      res.status(401).json({ message: "No user logged in." });
  }
});



module.exports = router;