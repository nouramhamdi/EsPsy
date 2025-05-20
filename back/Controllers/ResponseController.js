const nodemailer = require("nodemailer");
const TestResponse = require('../Models/TestResponse'); // Correct model

const Test = require("../Models/testModel");
const Resource = require("../Models/resourceModel");
const Response = require("../Models/TestResponse"); // ou TestResponse selon ton nom
const { analyzeWithAI, generateSupportMessage } = require("../services/analysisService");
// ✅ Envoyer le résultat par mail
exports.addResult = async (req, res) => {
  try {
    const responseId = req.params.id;
    const { result } = req.body;  // instead of 'message'

    // Find the response using the correct model name (TestResponse in this case)
    const response = await TestResponse.findById(responseId).populate('userId');

    if (!response) return res.status(404).json({ message: 'Réponse introuvable' });

    // Do not modify response.result here – keep OpenAI's analysis intact

    // Send the result via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'espsytunisia@gmail.com',
        pass: 'isae zjyl bkjm aiyv'  // Ensure passwords are securely handled
      }
    });

    const mailOptions = {
      from: 'espsytunisia@gmail.com',
      to: response.userId.email,
      subject: 'Test Result Available',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #1977CC;">Test Result Available</h2>
          <p>Hello ${response.userId.fullname},</p>
    
          <p>We hope you're doing well. Following your recent psychological test on Espsy, our psychologist has reviewed your responses and informs you that</p>
    
          <p style="font-style: italic;">${result}</p>
    
          <p>We encourage you to take the time to read this carefully. If you have any questions or would like to explore further support, please don't hesitate to reach out.</p>
    
          <p>Additionally, we recommend booking a follow-up appointment with your psychologist to discuss your results in more detail and plan any next steps.</p>
    
          <!-- Button to book appointment -->
          <a href="https://espsydeploy-git-main-raniakhedris-projects.vercel.app/app/Doctors" 
             style="background-color: #1977CC; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px; margin-top: 20px; text-align: center;">
            Book an Appointment
          </a>
    
          <p>Take care,</p>
          <p>The Espsy Team</p>
        </div>
      `
    };
    
    

    await transporter.sendMail(mailOptions);

    // Confirm email sent
    res.status(200).json({ message: 'Result sent', response });

    // Mark the response as treated
    response.treated = true;
    await response.save();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l’envoi du mail' });
  }
};





exports.getAllResponses = async (req, res) => {
  try {
    const { search, category, status } = req.query;

    let query = {};

    if (search) {
      query['userId.fullname'] = { $regex: search, $options: 'i' };
    }

    if (category) {
      query['testId.category'] = category;
    }

    if (status) {
      query['treated'] = status === 'treated';
    }

    const responses = await Response.find(query)
      .populate('userId', 'fullname')
      .populate('testId', 'title category')
      .populate('answers.questionId')
      .exec();

    res.json(responses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching responses', error: err });
  }
};



exports.submitResponse = async (req, res) => {
  try {
    const { testId, userId, answers } = req.body;

    if (!testId || !userId || !answers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const formattedAnswers = answers.map(answerObj => {
      const question = test.questions.find(q => q._id.toString() === answerObj.questionId.toString());
      const selectedChoice = question ? question.choices[answerObj.selectedOption] : "Invalid option";
      return {
        question: question?.text || "Question not found",
        selectedChoice,
      };
    });

    const supportMessage = await generateSupportMessage(test, formattedAnswers);

    const categoryToResourceType = {
      "Cognitive and Intelligence Tests": "well-being",
      "Personality Tests": "therapy",
      "Neuropsychological Tests": "therapy",
      "Achievement and Educational Tests": "well-being",
      "Diagnostic and Clinical Tests": "therapy",
      "Projective Tests": "therapy",
      "Behavioral and Observational Tests": "therapy",
      "Attitude and Opinion Tests": "meditation",
      "Vocational and Career Tests": "well-being",
      "Social and Emotional Intelligence Tests": "meditation",
      "Stress and Coping Tests": "meditation",
      "Memory and Attention Tests": "meditation"
    };
    

    const resourceType = categoryToResourceType[test.category] || "well-being"; // fallback

    setTimeout(async () => {
      try {
        const resultAnalysis = await analyzeWithAI(test, formattedAnswers);

        const resource = await Resource.findOne({ type: resourceType }).sort({ createdAt: -1 });

        const newResponse = new Response({
          testId,
          userId,
          answers,
          result: resultAnalysis,
          supportMessage,
          createdAt: new Date(),
        });

        await newResponse.save();

        res.status(201).json({
          message: supportMessage,
          resource: resource
            ? {
                title: resource.title,
                description: resource.description,
                type: resource.type,
              }
            : null,
        });
      } catch (error) {
        console.error("❌ Error during AI analysis:", error);
        res.status(500).json({ message: "Failed to save test response during AI analysis" });
      }
    }, 60000);
  } catch (error) {
    console.error("❌ Error saving test response:", error);
    res.status(500).json({ message: "Failed to save test response" });
  }
};









// Get test response
exports.getTestResponse = async (req, res) => {
  const { testId, userId } = req.params;

  try {
    const testResponse = await TestResponse.findOne({
      testId: testId,
      userId: userId,
    });

    if (testResponse) {
      return res.status(200).json(testResponse);
    } else {
      return res.status(404).json({ message: 'Test response not found' });
    }
  } catch (error) {
    console.error('Error fetching test response:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
