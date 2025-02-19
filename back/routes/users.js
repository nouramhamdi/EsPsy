var express = require('express');
var router = express.Router();
const userController = require("../Controllers/userController");
const upload = require("../middlewares/uploadFile")
const {requireAuthUser} = require('../middlewares/authMiddlewares')
const userModel = require("../Models/userModel"); 


/* GET users listing. */
router.get('/getAllUser',userController.getUsers );
router.get('/getUsersByName/:fullname', userController.getUsersByName);
router.get('/getUserById/:id',userController.getUserByID );
router.post('/addUser',userController.addUser );
router.post('/addwithImg',upload.single("image_user"),userController.addUser );
router.delete('/deleteUser/:id',userController.deleteUser );
router.put('/updateUserImg/:id',upload.single("image_user"),userController.updateUserImg );
router.put('/updateUser/:id',userController.updateUser );

router.put('/updatePassword/:id',userController.updateUserPassword );
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