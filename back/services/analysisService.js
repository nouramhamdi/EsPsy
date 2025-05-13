const axios = require('axios');

const Resource = require("../Models/resourceModel"); 

const generateSupportMessage = async (test, formattedAnswers) => {
  const analysisResult = await analyzeWithAI(test, formattedAnswers);
  let supportMessage = "";
  console.log("🔍 test.type:", test.category);

  // Example logic for generating the personalized message based on test type
  switch (test.category) {
    case "Cognitive and Intelligence Tests":
      if (analysisResult.intelligenceLevel > 120) {
        supportMessage = "You have high cognitive abilities, and you're likely to excel in problem-solving tasks.";
      } else if (analysisResult.intelligenceLevel > 85) {
        supportMessage = "You have average cognitive abilities and can handle most challenges with focus and dedication.";
      } else {
        supportMessage = "You might need to improve certain cognitive skills through focused exercises.";
      }
      break;
    case "Personality Tests":
      if (analysisResult.personalityType === "introvert") {
        supportMessage = "You are likely an introvert. You may find social situations draining, and prefer solitude to recharge.";
      } else if (analysisResult.personalityType === "extrovert") {
        supportMessage = "You are likely an extrovert. You thrive in social situations and feel energized by interacting with others.";
      }
      break;
    case "Neuropsychological Tests":
      if (analysisResult.memoryScore > 80) {
        supportMessage = "Your cognitive memory is strong. You process and retain information with ease.";
      } else {
        supportMessage = "You may want to focus on memory improvement techniques to strengthen retention.";
      }
      break;
    case "Stress and Coping Tests":
      if (analysisResult.stressLevel > 8) {
        supportMessage = "You are experiencing high levels of stress. It's important to take breaks and seek relaxation techniques.";
      } else if (analysisResult.stressLevel > 5) {
        supportMessage = "You are experiencing moderate stress. Consider adopting coping strategies like mindfulness.";
      } else {
        supportMessage = "You are managing stress well, but continue maintaining a healthy work-life balance.";
      }
      break;
    case "Social and Emotional Intelligence Tests":
      if (analysisResult.emotionalIntelligence > 80) {
        supportMessage = "You have high emotional intelligence. You are skilled at understanding and managing emotions in yourself and others.";
      } else {
        supportMessage = "You may benefit from improving your emotional intelligence, especially in social interactions.";
      }
      break;
    // Add more cases for other test types like 'Achievement and Educational', 'Diagnostic and Clinical', etc.
    default:
      supportMessage = "Your case needs to be reviewed by our psychologits, you'll recieve the results shortly. Please review the recommendations below for personalized advice.";
  }

  return supportMessage;
};





async function analyzeWithAI(test, answers) {
  try {

    // Construct the message for GPT-4
    const messageContent = `
    The user took the test: "${test.title}" (${test.category}).
    Here are their responses:

    ${answers
    .map(
        (item, i) =>
        `Q${i + 1}. ${item.question}\n→ Answer: ${item.selectedChoice}`
    )
    .join('\n\n')}

    Based on these responses, provide an insightful psychological analysis. Highlight any patterns, strengths, concerns, and suggest recommendations or next steps.
        `;


    // Send the formatted prompt to Azure OpenAI
    const response = await axios.post(
      'https://rania-m920fpt8-swedencentral.cognitiveservices.azure.com/openai/deployments/gpt-4/chat/completions?api-version=2025-01-01-preview',
      {
        messages: [
          {
            role: 'system',
            content:
              'You are a professional psychologist analyzing a test based on user-selected answers.',
          },
          {
            role: 'user',
            content: messageContent,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': 'A1PlifrWYCAjPm6jxhhHI6Ht5agRx5YJwLYMrkKe0MGQnLmhe31oJQQJ99BDACfhMk5XJ3w3AAAAACOGe69e',
        },
      }
    );

    // Return GPT analysis content
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error analyzing with AI:', error.response?.data || error);
    throw new Error('Failed to analyze with AI');
  }
}





module.exports = {
  analyzeWithAI,generateSupportMessage
};
