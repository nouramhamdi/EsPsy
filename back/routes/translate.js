const express = require('express');
const router = express.Router();
const axios = require('axios');
const { OPENAI_API_KEY } = require('../config/openaiConfig');

// Mapping des codes de langue pour Google Translate
const languageCodes = {
    'en': 'en',
    'fr': 'fr',
    'es': 'es',
    'de': 'de',
    'it': 'it',
    'pt': 'pt',
    'nl': 'nl',
    'ru': 'ru',
    'zh': 'zh-CN',
    'ja': 'ja',
    'ko': 'ko'
};

router.post('/', async (req, res) => {
    console.log('=== Nouvelle requête de traduction ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    const { content, targetLanguage } = req.body;

    if (!content || !targetLanguage) {
        console.log('Paramètres manquants:', { content, targetLanguage });
        return res.status(400).json({ error: 'Content and targetLanguage are required' });
    }

    // Vérifier si la langue cible est supportée
    const supportedLanguages = Object.keys(languageCodes);
    if (!supportedLanguages.includes(targetLanguage)) {
        console.log('Langue non supportée:', targetLanguage);
        return res.status(400).json({ error: 'Unsupported target language' });
    }

    try {
        // Essayer d'abord avec OpenAI
        try {
            console.log('Tentative de traduction avec OpenAI...');
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a professional translator. Translate the following content to ${targetLanguage}. Keep the same format and structure.`
                        },
                        {
                            role: 'user',
                            content: typeof content === 'string' ? content : JSON.stringify(content)
                        }
                    ],
                    temperature: 0.3
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`
                    }
                }
            );

            const translatedText = response.data.choices[0].message.content;
            console.log('Traduction réussie avec OpenAI');
            
            if (typeof content === 'object') {
                try {
                    const translatedObject = JSON.parse(translatedText);
                    return res.json(translatedObject);
                } catch (parseError) {
                    return res.json({ translated: translatedText });
                }
            }
            return res.json({ translated: translatedText });
        } catch (openaiError) {
            console.log('Échec de la traduction avec OpenAI, tentative avec Google Translate...');
            
            // Solution de secours avec Google Translate
            const textToTranslate = typeof content === 'string' ? content : 
                `${content.title}\n\n${content.description}`;
            
            const googleResponse = await axios.get(
                'https://translate.googleapis.com/translate_a/single',
                {
                    params: {
                        client: 'gtx',
                        sl: 'auto',
                        tl: languageCodes[targetLanguage],
                        dt: 't',
                        q: textToTranslate
                    }
                }
            );

            const translatedText = googleResponse.data[0].map(item => item[0]).join('');
            
            if (typeof content === 'object') {
                const [title, description] = translatedText.split('\n\n');
                return res.json({
                    title: title || content.title,
                    description: description || content.description
                });
            }
            
            return res.json({ translated: translatedText });
        }
    } catch (error) {
        console.error('Erreur détaillée:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack
        });
        return res.status(500).json({ 
            error: 'Translation failed',
            details: error.message,
            response: error.response?.data
        });
    }
});

module.exports = router; 