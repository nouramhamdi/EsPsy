const jwt = require("jsonwebtoken");
const userModel = require("../Models/userModel");

module.exports.requireAuthUser = async (req, res, next) => {
  const token = req.cookies.this_is_jstoken;
 // console.log("jwt", token);

  if (token) {
    jwt.verify(token, "token", async (err, decodedToken) => {
      if (err) {
        res.status(441).json("/problem decoding token");
      } else {
        user = await userModel.findById(decodedToken.id)
        req.session.user = user
        console.log("user :",req.session.user)

        next();
      }
    });
  } else {
    res.status(431).json("/pas de token");
  }
};
