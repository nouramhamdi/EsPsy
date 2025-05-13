const jwt = require("jsonwebtoken");
const userModel = require("../Models/userModel");

module.exports.requireAuthUser = async (req, res, next) => {
  const token = req.cookies.this_is_jstoken;

  if (token) {
    jwt.verify(token, "token", async (err, decodedToken) => {
      if (err) {
        res.status(441).json("/problem decoding token");
      } else {
        const user = await userModel.findById(decodedToken.id);
        req.session.user = user;
        req.user = user; 
        console.log("user :", req.user);
        next();
      }
    });
  } else {
    res.status(431).json("/pas de token");
  }
};

