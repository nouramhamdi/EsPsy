const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    fullname: String,    
    username: String,
    email: String,
    password: String,
    datebirth: { type: Date },
    number: Number,
    role: {
      type: String,
      enum: ["admin", "student","psychologist","teacher"],
    },
    blocked: { type: Boolean, default: false },
    lastActiveAt: { type: Date },
    image_user: { type: String, required: false, default: "client.png" },
    verificationToken: String,
    resetPasswordExpire: Date,
    verified: {
      type: Boolean,
      default: false
    },
    RequestRegistration: { type: Boolean},
    RequestResponse:{ type: Boolean},
    ResetPassword: { type: Boolean},
    availability: [
      {
        date: Date, // Available date
        slots: [{ time: String, booked: Boolean }], // Time slots
      },
    ],
    ratings: [{
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

userSchema.post("save", async function (req, res, next) {
  console.log("new user was created & saved successfully");
  next();
});

userSchema.pre("save", async function (next) {
  try {
    
    const User = this;
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }    
    (User.CreatedAt = new Date()), (User.UpdatedAt = new Date()), next();
  } catch (err) {
    next(err);
  }
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email: email });

  if (user) {
    
    console.log("Stored hashed password: ", user.password);
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      // if(user.etat === true) {
      return user;
      // }
      // throw new Error('incorrect password')
    }
    throw new Error('incorrect password',user.password)
  }
  throw Error('incorrect email')
};

const User = mongoose.model("User", userSchema);

module.exports = User;