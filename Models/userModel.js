const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); //modume pour chiffrer les mots de passe avant de les stocker

const userSchema = new mongoose.Schema(
  {
    fullname: String,    
    username: String,
    age: Number,
    email: String,
    password: String,
    datebirth: { type: Date },
    number: Number,
    role: {
      type: String,
      enum: ["admin", "user","psychologist","teacher"], default: 'user' 
    },
    image_user: { type: String, required: false, default: "client.png" },
    isBlocked: { type: Boolean, default: false }
  },
  { timestamps: true } //{ timestamps: true } ajoute automatiquement les champs createdAt et updatedAt
);
//Middleware post après la sauvegarde d'un utilisateur
//post("save") est un middleware qui s'exécute après qu'un utilisateur ait été enregistré.
//Il affiche un message dans la console.
userSchema.post("save", async function (req, res, next) {
  console.log("new user was created & saved successfully");
  next();
});
//Middleware pre avant la sauvegarde d'un utilisateur
userSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt();
    const User = this;
    User.password = await bcrypt.hash(User.password, salt);
    
    (User.CreatedAt = new Date()), (User.UpdatedAt = new Date()), next();
  } catch (err) {
    next(err);
  }
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email: email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      // if(user.etat === true) {
      return user;
      // }
      // throw new Error('incorrect password')
    }
    throw new Error('incorrect password')
  }
  throw Error('incorrect email')
};

const User = mongoose.model("User", userSchema);

module.exports = User;