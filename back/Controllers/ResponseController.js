const Response = require('../Models/TestResponse');
const nodemailer = require("nodemailer");

exports.addResult = async (req, res) => {
    try {
      const responseId = req.params.id;
      const result = req.body;

      const response = await Response.findByIdAndUpdate(
        responseId,
        { result },
        { new: true }
      ).populate('userId');
  
      if (!response) return res.status(404).json({ message: 'Response not found' });
  
      // Send mail to the user
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'rannniakhedri@gmail.com',
          pass: 'qapd wgwo hlet rlop'
        }
      });
  
      const mailOptions = {
        from: 'rannniakhedri@gmail.com',
        to: response.userId.email,
        subject: 'Test Result Available',
        text: `Hello ${response.userId.fullname},\n\nYour test result is:\n\n${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating result and sending email' });
    }
  };
  