var express = require('express');
var router = express.Router();
const userController = require("../Controllers/userController");
const upload = require("../middlewares/uploadFile")
const { validateUserInput, handleValidationErrors } = require('../middlewares/validateUserInput');
const userModel = require("../Models/userModel"); 
const { checkBlocked } = require('../middlewares/checkBlocked');



/* GET users listing. */
router.get('/getAllUser',userController.getUsers );
router.get('/getUsersByName/:fullname', userController.getUsersByName);
router.get('/getUserById/:id',userController.getUserByID );
router.post('/addUser', validateUserInput, handleValidationErrors , userController.addUser );
// router.post('/addUser', validateUserInput, handleValidationErrors,
//  async (req, res) => {
//     try {
//       const { fullname, username, email, password, age, datebirth, number, role, image_user } = req.body;
  
//       // Créer un nouvel utilisateur
//       const newUser = new User({
//         fullname, username, email, password, age, datebirth, number, role, image_user
//       });
  
//       await newUser.save();
//       res.status(201).json({ message: 'User created successfully', user: newUser });
//     } catch (err) {
//       res.status(500).json({ message: 'Server error', error: err.message });
//     }
//   });
router.post('/addwithImg',upload.single("image_user"),userController.addUser );
router.delete('/deleteUser/:id',userController.deleteUser );
router.put('/updateUserImg/:id',upload.single("image_user"),userController.updateUserImg );
router.put('/updateUser/:id',userController.updateUser );

router.put('/updatePassword/:id',userController.updateUserPassword );
router.post('/login'/*, checkBlocked*/ , userController.login );
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 🔒 Bloquer un utilisateur
router.put('/block/:adminId/:userId'/*, requireAuthUser*/ , async (req, res) => {
  const { adminId, userId } = req.params;  // Récupération des IDs depuis l'URL

  try {
      // Vérification si l'ID de l'admin existe et est un "admin"
      const admin = await userModel.findById(adminId);
      if (!admin || admin.role !== "admin") {
          return res.status(403).json({ message: "L'ID fourni ne correspond pas à un administrateur." });
      }

      // Vérification si l'utilisateur à bloquer existe
      const userToBlock = await userModel.findById(userId);
      if (!userToBlock) {
          return res.status(404).json({ message: "Utilisateur introuvable." });
      }

      // Vérification si l'utilisateur est déjà bloqué
      if (userToBlock.isBlocked) {
          return res.status(400).json({ message: "L'utilisateur est déjà bloqué." });
      }

      // Modification de l'attribut isBlocked de l'utilisateur à true
      userToBlock.isBlocked = true;
      await userToBlock.save();

      res.status(200).json({ message: "L'utilisateur a été bloqué avec succès." });

  } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});
// // 🔓 Débloquer un utilisateur
router.put('/unblock/:adminId/:userId'/*, requireAuthUser*/ , async (req, res) => {
  const { adminId, userId } = req.params;  // Récupération des IDs depuis l'URL

  try {
      // Vérification si l'ID de l'admin existe et est un "admin"
      const admin = await userModel.findById(adminId);
      if (!admin || admin.role !== "admin") {
          return res.status(403).json({ message: "L'ID fourni ne correspond pas à un administrateur." });
      }

      // Vérification si l'utilisateur à débloquer existe
      const userToUnblock = await userModel.findById(userId);
      if (!userToUnblock) {
          return res.status(404).json({ message: "Utilisateur introuvable." });
      }

      // Vérification si l'utilisateur est déjà débloqué
      if (!userToUnblock.isBlocked) {
          return res.status(400).json({ message: "L'utilisateur est déjà débloqué." });
      }

      // Modification de l'attribut isBlocked de l'utilisateur à false
      userToUnblock.isBlocked = false;
      await userToUnblock.save();

      res.status(200).json({ message: "L'utilisateur a été débloqué avec succès." });

  } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});


module.exports = router;