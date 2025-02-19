const userModel = require("../Models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const maxAge = 2 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, "token", { expiresIn: maxAge });
};
const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number
};








// Add a new user
module.exports.addUser = async (req, res) => {
  try {
    const { fullname, username, age, email, password, datebirth, number, role } = req.body;
    const image_user = req.file ? req.file.filename : "client.png";
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@esprit\.tn$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email. The email must be in the format of 'example@esprit.tn'" });
    }


    const newUser = new userModel({
      fullname,
      username,
      age,
      email,
      password: hashedPassword,
      datebirth: new Date(datebirth),
      number,
      role: role || "user", // Default to 'user' if role not provided
      image_user,
    });

    const addedUser = await newUser.save();
    res.status(201).json({ addedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
module.exports.getUsers = async (req, res) => {
  try {
    sendVerificationEmail("yosr.kheriji@esprit.tn").then((code) => {
      console.log("Verification code sent:", code);
    });
    
    const users = await userModel.find();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user by ID
module.exports.getUserByID = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get users by name
module.exports.getUsersByName = async (req, res) => {
  try {
    const { fullname } = req.params;

    if (typeof fullname !== "string") {
      return res.status(400).json({ message: "Fullname must be a string" });
    }

    const users = await userModel.find({
      fullname: { $regex: fullname, $options: "i" },
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Update user details
module.exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, username, age, email, datebirth, number, role } = req.body;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@esprit\.tn$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email. The email must be in the format of 'example@esprit.tn'" });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      {
        $set: {
          fullname,
          username,
          age,
          email,
          datebirth: datebirth ? new Date(datebirth) : undefined,
          number,
          role,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user password with hashing
module.exports.updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user image
module.exports.updateUserImg = async (req, res) => {
  try {
    const { id } = req.params;
    const { filename } = req.file;

    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { $set: { image_user: filename } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
module.exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User login
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.login(email, password);

    const token = createToken(user._id);
    req.session.user = user;
    req.session.save();

    res.cookie("this_is_jstoken", token, { httpOnly: false, maxAge: maxAge * 1000 });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User logout
module.exports.logout = (req, res) => {
  try {
    res.clearCookie("this_is_jstoken");
    res.clearCookie("connect.sid");

    req.session.user = null;
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to regenerate session" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendVerificationEmail = async (email) => {
  try {
    const verificationCode = generateVerificationCode();

    // Configure the email transport
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: "ayariliwa66@gmail.com", 
        pass: "qlar jqip zzgt udfr", 
      },
    });

    // Email options
    const mailOptions = {
      from: "ayariliwa66@gmail.com",
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${verificationCode}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully!");

    return verificationCode; 
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
};