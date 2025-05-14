const userModel = require("../Models/userModel");
const TestResponse = require("../Models/TestResponse");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const maxAge = 2 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, "token", { expiresIn: maxAge });
};




module.exports.getPsychologistAvailability = async (req, res) => {
  try {
    const { psychologistId } = req.params;

    const psychologist = await User.findOne({ _id: psychologistId, role: "psychologist" });
    if (!psychologist) {
      return res.status(404).json({ message: "Psychologist not found" });
    }

    if (!psychologist.availability || psychologist.availability.length === 0) {
      return res.status(200).json({ message: "No available slots", slots: [] });
    }

    res.json(psychologist.availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ message: "Error fetching availability", error });
  }
};





// Add a new user
module.exports.addUser = async (req, res) => {
  try {
    const { fullname, username, email, password, datebirth, number, role } = req.body;
    
    const existingUser = await userModel.findOne({ email : email });
    if (existingUser) {
       return res.status(401).json({ success: false, message :'This Email is already registered' });
    }

    const newUser = new userModel({
      fullname,
      username,
      email,
      password,
      datebirth: new Date(datebirth),
      number,
      role: role || "student", 
      blocked:false,
      lastActiveAt: new Date()
    });
    if( newUser.role ==="teacher" || newUser.role === "psychologist"){
      newUser.RequestRegistration = true;
      newUser.RequestResponse = false; 
    }
    
    const addedUser = await newUser.save();
    res.status(201).json({ success: true, user: addedUser, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all users
// Get all users
module.exports.getUsers = async (req, res) => {
  try {
    const allUsers = await userModel.find();

    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Ensure correct logical grouping using parentheses
    const users = allUsers.filter(
      (user) => 
        (user.RequestRegistration === false && user.RequestResponse === true) ||
        (user.RequestRegistration === undefined && user.RequestResponse === undefined)
    );

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


//get users by role and registration Request and response informations

module.exports.getPendingRequests = async (req, res) => {
  try {
    const users = await userModel.find({
      role: { $in: ["psychologist", "teacher"] }, 
      RequestRegistration: true, 
      RequestResponse: false, 
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No pending registration requests found" });
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
    
    
    if (password && user.password) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }
    }
    if(password && !user.password){
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
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
      const validRoles = ['admin', 'student', 'psychologist', 'teacher'];
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


const sendVerificationEmail = async (email, verificationUrl) => {
  try {
    // Configure the email transport (keep your existing setup)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: 'espsytunisia@gmail.com',  // Use a proper email here
        pass: 'isae zjyl bkjm aiyv' 
      },
    });

    // Email options with verification button
    const mailOptions = {
      from: "espsytunisia@gmail.com",
      to: email,
      subject: "Verify Your Account",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">Account Verification Required</h2>
          <p>Please click the button below to verify your account:</p>
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #2563eb; 
             color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">
             Verify Account
          </a>
          <p style="margin-top: 20px; color: #6b7280;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully!");

  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
};

const sendWelcomeEmail = async (email) => {
  try {
    // Configure the email transport (keep your existing setup)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: 'espsytunisia@gmail.com',  // Use a proper email here
        pass: 'isae zjyl bkjm aiyv' 
      },
    });

    // Email options with a welcome message
    const mailOptions = {
      from: "espsytunisia@gmail.com",
      to: email,
      subject: "Welcome to EsPsy!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">Welcome to EsPsy!</h2>
          <p>You have successfully signed up on our platform. We are thrilled to have you with us!</p>
          <p>At EsPsy, we aim to provide you with the best experience. Explore our services and make the most of your journey with us.</p>
          <p style="margin-top: 20px; color: #6b7280;">
            If you have any questions or need assistance, feel free to reach out to us.
          </p>
          <p>Best regards,</p>
          <p>The EsPsy Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully!");

  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send welcome email");
  }
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const token = createToken(user._id); 
    
    const verificationUrl = `http://localhost:3000/auth/verify-account/${token}`;

    await sendVerificationEmail(email, verificationUrl);

    user.verificationToken = token;
    user.verified = false;
    user.ResetPassword = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Error in account recovery:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.ResetPassword = async (req, res) => {
  try {
    const { newPassword,email } = req.body; 
    const user = await userModel.findOne({email});

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    user.password = newPassword;
    user.ResetPassword = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password" });
  }
}

exports.MailAfterSignUp = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await sendWelcomeEmail(user.email);
    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Error in account recovery:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.verifyAccount = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify token using your existing method
    const decoded = jwt.verify(token, "token"); // Replace "token" with your secret
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Update user verification status
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      user :user
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid or expired token'
    });
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






//stats users by role 
module.exports.getUsersByRole = async (req, res) => {
  try {
    const roleStats = await userModel.aggregate([
      {
        $group: {
          _id: null,
          users: {
            $sum: { $cond: [{ $eq: ["$role", "student"] }, 1, 0] }
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
      students: 0, 
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


module.exports.getPsychologists = async (req, res) => {
  try {
    const psychologists = await userModel.find({ role: 'psychologist', verified: true }); 
    res.status(200).json(psychologists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};







// handle registration Request by teachers and psycholosist

const sendRejectionEmail = async (email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: 'espsytunisia@gmail.com',  // Use a proper email here
        pass: 'isae zjyl bkjm aiyv' 
      },
    });

    const mailOptions = {
      from: "espsytunisia@gmail.com",
      to: email,
      subject: "Registration Request Declined",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #dc2626;">Registration Decision</h2>
          <p>We regret to inform you that your registration request to join EsPsy has been declined.</p>
          <p>This decision was made after careful consideration of your application.</p>
          <p style="margin-top: 20px; color: #6b7280;">
            If you believe this was a mistake or have any questions, please contact our support team.
          </p>
          <p>Best regards,</p>
          <p>The EsPsy Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("Rejection email sent successfully!");
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw new Error("Failed to send rejection email");
  }
};
const sendAcceptRequestEmail = async (email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: 'espsytunisia@gmail.com',  // Use a proper email here
        pass: 'isae zjyl bkjm aiyv' 
      },
    });

    const mailOptions = {
      from: "espsytunisia@gmail.com",
      to: email,
      subject: "Registration Request Accepted",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #34A853;">Registration Decision</h2>
          <p>We regret to inform you that your registration request to join EsPsy has been Accepted.</p>
          <p>This decision was made after careful consideration of your application.</p>
          <p style="margin-top: 20px; color: #6b7280;">
            Now You are allowed to use your account to log in with Es Psy Dashboard. 
          </p>
          <p>Best rega// Add a new user
module.exports.addUser = async (req, res) => {
  try {
    const { fullname, username, email, password, datebirth, number, role } = req.body;

    // Validate user input
    if (!fullname || !username || !email || !password || !datebirth || !number) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ message: 'This Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      fullname,
      username,
      email,
      password: hashedPassword,
      datebirth: new Date(datebirth),
      number,
      role: role || "student",
      blocked: false,
      lastActiveAt: new Date()
    });

    if (newUser.role === "teacher" || newUser.role === "psychologist") {
      newUser.RequestRegistration = true;
      newUser.RequestResponse = false;
    }

    const addedUser = await newUser.save();
    await sendWelcomeEmail(addedUser.email);
    res.status(201).json({ addedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};rds,</p>
          <p>The EsPsy Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("Rejection email sent successfully!");
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw new Error("Failed to send rejection email");
  }
};
const sendEmailToAdmin = async (userEmail, subject, body) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: 'espsytunisia@gmail.com',  // Use a proper email here
      pass: 'isae zjyl bkjm aiyv' 
 
    },
  });

  const mailOptions = {
    from: userEmail, // Sender's email
    to: "espsytunisia@gmail.com", // Admin's email
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2563eb;">New Registration Request</h2>
        <p><strong>From:</strong> ${userEmail}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${body}</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log("Email sent to admin successfully!");
};
module.exports.AcceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { 
        RequestRegistration: false,
        RequestResponse: true,
        verified: true // If you want to automatically verify accepted users
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await sendAcceptRequestEmail(updatedUser.email);

    res.status(200).json({ 
      message: "Request accepted successfully",
      user: updatedUser 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports.CancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send rejection email first
    await sendRejectionEmail(user.email);
    
    // Delete user from database
    await userModel.deleteOne({ _id: id });

    res.status(200).json({ 
      message: "Request declined and user removed successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//contact admin send request to admin to register 
module.exports.CancelRequest = async (req, res) => {
  const { email } = req.params; // Get the user's email from the URL
  const { subject, body } = req.body; // Get the subject and body from the request body
  try {
    // Send email to admin
    await sendEmailToAdmin(email, subject, body);

    res.status(200).json({ message: "Request sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send request" });
  }
}



exports.getPsychologistStats = async (req, res) => {
  try {
    const stats = await userModel.aggregate([
      {
        $match: {
          role: 'psychologist',
          'ratings.0': { $exists: true } // Only include psychologists with ratings
        }
      },
      {
        $project: {
          fullname: 1,
          image_user: 1,
          totalRatings: { $sum: '$ratings.rating' },
          numberOfReviews: { $size: '$ratings' },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: '$ratings' }, 0] },
              then: { $divide: [{ $sum: '$ratings.rating' }, { $size: '$ratings' }] },
              else: 0
            }
          }
        }
      },
      {
        $sort: { averageRating: -1 } // Sort by highest rated first
      }
    ]);

    res.json({
      success: true,
      count: stats.length,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching psychologist stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// In your user controller
exports.getTestParticipationStats = async (req, res) => {
  try {
    // Get all unique users who have taken tests
    const usersWithTests = await TestResponse.distinct('userId');
    
    // Get total user count
    const totalUsers = await userModel.countDocuments();
    
    res.status(200).json({
      success: true,
      data: {
        passedUsers: usersWithTests.length,
        notPassedUsers: totalUsers - usersWithTests.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};