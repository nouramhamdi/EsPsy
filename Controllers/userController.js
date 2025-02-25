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
    const { fullname, username, email, password, datebirth, number, role } = req.body;
    
    const existingUser = await userModel.findOne({ email : email });
    if (existingUser) {
       return res.status(401).json({ message :'This Email is already registered' });
    }

    const newUser = new userModel({
      fullname,
      username,
      email,
      password,
      datebirth: new Date(datebirth),
      number,
      role: role || "user", 
      blocked:false,
      lastActiveAt: new Date()
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
   /* sendVerificationEmail("yosr.kheriji@esprit.tn").then((code) => {
      console.log("Verification code sent:", code);
    });*/
    
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
    const { fullname, username, email, number, password } = req.body;

    // Find the user by ID
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare the update object
    const updateData = {
      fullname,
      username,
      email,
      number,
    };

    // Hash the new password if provided and different from the current password
    if (password) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }
    }

    // Update the user
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({ updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.changeRole = async (req, res) => {
  try {
      const { id } = req.params;
      const { newRole } = req.body;

      // Validate role
      const validRoles = ['admin', 'user', 'psychologist', 'teacher'];
      if (!validRoles.includes(newRole)) {
          return res.status(400).json({ 
              success: false,
              message: 'Invalid role specified' 
          });
      }

      // Update user
      const updatedUser = await userModel.findByIdAndUpdate(
        id,
        { $set: { role: newRole } },
        { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({
              success: false,
              message: 'User not found'
          });
      }

      res.json({
          success: true,
          user: updatedUser
      });
  } catch (error) {
      console.error('Error changing role:', error);
      res.status(500).json({
          success: false,
          message: error.message
      });
  }
};


module.exports.updateUserPassword = async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const updatedUser = await userModel.findByIdAndUpdate(
        id,
        { $set: { password: hashedPassword } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {S
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
module.exports.updateLastActive = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await userModel.findByIdAndUpdate(
       id,
       { $set: { lastActiveAt: new Date() } },
       { new: true } // Ensure the updated document is returned
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ updatedUser });
  } catch (error) {
    console.error('Error updating last active timestamp:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

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




//block user

exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findByIdAndUpdate(userId, { $set: { blocked: true } }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User blocked successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findByIdAndUpdate(userId, { $set: { blocked: false } }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User blocked successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error });
  }
};



//stats
/*
 module.exports.getActiveUsersStats = async (req,res) => {
  try {
    // Calculate the start date (7 days ago)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Aggregate active users by date
    const stats = await userModel.aggregate([
      {
        $match: {
          lastActiveAt: { $gte: startDate },
        },
      },
      {
        $project: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$lastActiveAt" } },
        },
      },
      {
        $group: {
          _id: "$date",
          activeUserCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date ascending
      },
    ]);

    // Format the result
    const result = stats.map(stat => ({
      date: stat._id,
      activeUserCount: stat.activeUserCount,
    }));

    
    return res.status(200).json({ result });

  } catch (error) {
    console.error('Error fetching active users stats:', error);
    throw error;
  }
};*/



module.exports.getUsersByRole = async (req, res) => {
  try {
    const roleStats = await userModel.aggregate([
      {
        $group: {
          _id: null,
          users: {
            $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] }
          },
          teachers: {
            $sum: { $cond: [{ $eq: ["$role", "teacher"] }, 1, 0] }
          },
          psychologists: {
            $sum: { $cond: [{ $eq: ["$role", "psychologist"] }, 1, 0] }
          }
        }
      },
      { $project: { _id: 0 } }
    ]);

    // Handle case with no users
    const result = roleStats[0] || { 
      users: 0, 
      teachers: 0, 
      psychologists: 0 
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};