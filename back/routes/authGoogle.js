var express = require('express');
var router = express.Router();
const userModel = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const maxAge = 2 * 60 * 60;
const passport = require('passport');
const createToken = (id) => {
  return jwt.sign({ id }, "token", { expiresIn: maxAge });
};
/* GET home page. */

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    
       try{
        const { id, displayName, emails, photos } = req.user;
      
        const existingUser = await userModel.findOne({ email: emails[0].value });
        

        if (existingUser) {
           const token = createToken(existingUser.id); 
           const verificationUrl = `https://espsyy-raniakhedris-projects.vercel.app/auth/verify-account/${token}`; 
           existingUser.verificationToken = token;
           await existingUser.save();
           res.redirect(verificationUrl);
        }
        else {
          const newUser = await userModel.create({
            fullname: displayName,
            email: emails[0].value,
            role: "student",
          });
           const token = createToken(newUser.id); 
           const verificationUrl = `https://espsyy-raniakhedris-projects.vercel.app/auth/verify-account/${token}`; 
           newUser.verificationToken = token;
           await newUser.save();
           res.redirect(verificationUrl);
        }

       }catch (error) {
          console.error('Authentication error:', error);
          res.redirect(`https://espsyy-raniakhedris-projects.vercel.app/auth/sign-in`);
        }
  }
);
module.exports = router;
