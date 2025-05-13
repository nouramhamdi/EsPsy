import axios from 'axios';
import { searchImagesOnGoogle } from './GoogleImageSearchService';
import { ARTIST_IMAGES, EVENT_TYPE_IMAGES, LOCATION_IMAGES, DEFAULT_IMAGE } from './ImagePaths';

// Configuration de l'API Hugging Face
const HUGGING_FACE_API_KEY = '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';
const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/';

// Catégories d'événements avec leurs mots-clés associés
const EVENT_CATEGORIES = {
    'sport': ['sport', 'football', 'basketball', 'tennis', 'natation', 'gymnastique', 'athletisme', 'équitation', 'cheval', 'balade', 'randonnée', 'course', 'marathon', 'jogging', 'yoga', 'fitness', 'musculation'],
    'culture': ['concert', 'musique', 'théâtre', 'cinéma', 'exposition', 'art', 'peinture', 'sculpture', 'danse', 'ballet', 'opéra', 'spectacle', 'festival'],
    'éducation': ['conférence', 'séminaire', 'formation', 'atelier', 'cours', 'université', 'école', 'étudiant', 'professeur', 'apprentissage', 'éducation'],
    'bien-être': ['yoga', 'méditation', 'relaxation', 'massage', 'thérapie', 'santé', 'bien-être', 'zen', 'détente', 'sophrologie'],
    'social': ['rencontre', 'réunion', 'soirée', 'fête', 'anniversaire', 'mariage', 'dîner', 'déjeuner', 'brunch', 'café', 'thé'],
    'nature': ['randonnée', 'balade', 'promenade', 'parc', 'jardin', 'forêt', 'montagne', 'mer', 'plage', 'camping', 'pique-nique'],
    'professionnel': ['réunion', 'conférence', 'séminaire', 'formation', 'atelier', 'travail', 'bureau', 'entreprise', 'réseautage', 'networking']
};

// Fonction pour identifier la catégorie d'un événement
const identifyEventCategory = (title, description) => {
    const text = `${title} ${description}`.toLowerCase();
    let bestMatch = { category: null, score: 0 };

    for (const [category, keywords] of Object.entries(EVENT_CATEGORIES)) {
        let score = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                score++;
            }
        }
        if (score > bestMatch.score) {
            bestMatch = { category, score };
        }
    }

    return bestMatch.category;
};

// Fonction pour utiliser l'API Hugging Face
const queryHuggingFace = async (text) => {
    try {
        const response = await axios.post(
            `${HUGGING_FACE_API_URL}facebook/bart-large-cnn`,
            { inputs: text },
            {
                headers: {
                    'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error querying Hugging Face:', error);
        return null;
    }
};

// Fonction pour générer une requête de recherche optimisée
const generateOptimizedSearchQuery = async (title, description = '', eventType = '') => {
    try {
        // Identifier la catégorie de l'événement
        const category = identifyEventCategory(title, description);
        
        // Combiner le titre et la description pour l'analyse
        const combinedText = `${title}. ${description}`;
        
        // Utiliser Hugging Face pour extraire les mots-clés importants
        const aiAnalysis = await queryHuggingFace(combinedText);
        
        // Construire la requête de recherche
        let searchQuery = title;
        
        // Ajouter les mots-clés de l'analyse IA si disponible
        if (aiAnalysis && aiAnalysis[0] && aiAnalysis[0].summary_text) {
            const summary = aiAnalysis[0].summary_text;
            const keywords = extractKeywords(summary);
            searchQuery += ' ' + keywords.join(' ');
        }
        
        // Ajouter la catégorie si identifiée
        if (category) {
            searchQuery += ' ' + category;
        }
        
        // Ajouter le type d'événement si spécifié
        if (eventType) {
            searchQuery += ' ' + eventType;
        }
        
        // Ajouter des mots-clés pour améliorer la recherche d'images
        searchQuery += ' image photo';
        
        // Nettoyer et optimiser la requête
        return searchQuery
            .toLowerCase()
            .replace(/[^\w\sàáâäæçèéêëìíîïòóôöùúûüÿ]/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    } catch (error) {
        console.error('Error generating optimized search query:', error);
        return title.toLowerCase().trim();
    }
};

// Utilisons une approche avec des images locales
/**
 * Génère une image basée sur le titre, la description et le type d'événement
 * en utilisant une recherche d'images Google
 * @param {string} title - Le titre de l'événement
 * @param {string} eventType - Le type d'événement (Workshop, Therapy Session, etc.)
 * @param {string} description - La description de l'événement (optionnel)
 * @returns {Promise<Array>} - Un tableau contenant les données de l'image générée
 */
/**
 * Recherche une image sur le web en utilisant le titre exact
 * @param {string} searchQuery - La requête de recherche
 * @returns {Promise<string|null>} - L'URL de l'image trouvée ou null
 */
const searchImageOnWeb = async (searchQuery) => {
    try {
        console.log('Searching image on web for:', searchQuery);

        // Ajouter un timestamp pour éviter la mise en cache
        const timestamp = Date.now();
        const randomSeed = Math.floor(Math.random() * 10000);

        // Essayer d'abord avec Unsplash qui donne de bons résultats pour les requêtes spécifiques
        const unsplashUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(searchQuery)}&t=${timestamp}&r=${randomSeed}`;
        console.log('Trying Unsplash URL:', unsplashUrl);

        // Vérifier si l'URL est accessible
        try {
            const response = await fetch(unsplashUrl, { method: 'HEAD' });
            if (response.ok) {
                return unsplashUrl;
            }
        } catch (error) {
            console.error('Error with Unsplash:', error);
        }

        // Si Unsplash échoue, essayer avec Picsum Photos
        const searchHash = hashString(searchQuery + timestamp + randomSeed);
        const picsumUrl = `https://picsum.photos/seed/${searchHash}/800/600?t=${timestamp}`;
        console.log('Trying Picsum URL:', picsumUrl);

        try {
            const response = await fetch(picsumUrl, { method: 'HEAD' });
            if (response.ok) {
                return picsumUrl;
            }
        } catch (error) {
            console.error('Error with Picsum:', error);
        }

        return null;
    } catch (error) {
        console.error('Error searching image on web:', error);
        return null;
    }
};

export const generateImageFromTitle = async (title, eventType = '', description = '') => {
    try {
        console.log('Generating image for:', { title, eventType, description });

        // 1. Essayer d'abord la recherche Google directe avec la catégorie
        const category = identifyEventCategory(title, description);
        try {
            const directSearchQuery = `${title} ${description} ${category || ''}`.trim();
            const googleImages = await searchImagesOnGoogle(directSearchQuery);
            if (googleImages && googleImages.length > 0) {
                console.log('Found image on Google with direct search:', googleImages[0]);
                return [{
                    url: googleImages[0],
                    searchQuery: directSearchQuery,
                    source: 'Google Direct Search'
                }];
            }
        } catch (googleError) {
            console.error("Erreur lors de la recherche directe sur Google:", googleError);
        }

        // 2. Si la recherche directe échoue, utiliser l'IA pour optimiser la recherche
        const optimizedQuery = await generateOptimizedSearchQuery(title, description, eventType);
        try {
            const googleImages = await searchImagesOnGoogle(optimizedQuery);
            if (googleImages && googleImages.length > 0) {
                console.log('Found image on Google with optimized search:', googleImages[0]);
                return [{
                    url: googleImages[0],
                    searchQuery: optimizedQuery,
                    source: 'Google Optimized Search'
                }];
            }
        } catch (googleError) {
            console.error("Erreur lors de la recherche optimisée sur Google:", googleError);
        }

        // 3. Si Google échoue, essayer avec les images spécifiques
        const keywords = extractKeywords(title, description);
        if (category) {
            keywords.push(category);
        }
        if (eventType) {
            keywords.push(eventType);
        }

        const specificImageUrl = await getSpecificImageForKeywords(keywords, title, description);
        if (specificImageUrl) {
            console.log('Using specific image for keywords:', specificImageUrl);
            return [{ url: specificImageUrl }];
        }

        // 4. En dernier recours, utiliser une image par défaut basée sur la catégorie
        return getFallbackImage(category || eventType);
    } catch (error) {
        console.error('Error in image generation process:', error);
        return getFallbackImage(eventType);
    }
};

// Fonction améliorée d'extraction de mots-clés
function extractKeywords(title, description = '') {
    const keywords = [];
    const stopWords = new Set([
        'this', 'that', 'with', 'from', 'have', 'will', 'pour', 'dans', 'avec', 'des', 'les', 'une', 'est',
        'the', 'and', 'or', 'but', 'for', 'nor', 'so', 'yet', 'a', 'an', 'in', 'on', 'at', 'to', 'of',
        'de', 'la', 'le', 'un', 'une', 'des', 'les', 'et', 'ou', 'mais', 'car', 'donc', 'or', 'ni', 'soit',
        'qui', 'que', 'quoi', 'quel', 'quelle', 'quels', 'quelles', 'dont', 'où', 'comment', 'pourquoi',
        'avec', 'sans', 'sous', 'sur', 'dans', 'entre', 'par', 'pour', 'vers', 'chez', 'dès', 'depuis'
    ]);

    // Fonction pour extraire les mots-clés d'un texte
    const extractFromText = (text) => {
        if (!text) return [];
        
        // Normaliser le texte
        const normalizedText = text
            .toLowerCase()
            .replace(/[^\w\sàáâäæçèéêëìíîïòóôöùúûüÿ]/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Extraire les mots-clés
        const words = normalizedText.split(/\s+/);
        
        return words.filter(word => 
            word.length > 3 && 
            !stopWords.has(word) &&
            !/^\d+$/.test(word) && // Exclure les nombres seuls
            !/^[a-z]{1,2}$/.test(word) // Exclure les mots trop courts
        );
    };

    // Extraire les mots-clés du titre
    keywords.push(...extractFromText(title));

    // Extraire les mots-clés de la description
    if (description) {
        keywords.push(...extractFromText(description));
    }

    // Éliminer les doublons et retourner les mots-clés uniques
    return [...new Set(keywords)];
}

/**
 * Mélange aléatoirement un tableau
 * @param {Array} array - Le tableau à mélanger
 * @returns {Array} - Le tableau mélangé
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Crée un hash simple à partir d'une chaîne
 * @param {string} str - La chaîne à hacher
 * @returns {string} - Le hash
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convertir en entier 32 bits
    }
    return Math.abs(hash).toString();
}

/**
 * Fonction utilitaire pour obtenir une image de secours
 * @param {string} eventType - Le type d'événement
 * @returns {Promise<Array>} - Un tableau contenant l'URL de l'image de secours
 */
const getFallbackImage = (eventType) => {
    // Images locales de secours par type d'événement
    const staticImages = {
        'Workshop': EVENT_TYPE_IMAGES.workshop || '/event-images/workshop.jpg',
        'Therapy Session': EVENT_TYPE_IMAGES.therapy || '/event-images/therapy.jpg',
        'Seminar': EVENT_TYPE_IMAGES.seminar || '/event-images/seminar.jpg',
        'Social Event': EVENT_TYPE_IMAGES.social || '/event-images/social.jpg',
        'Support Group': EVENT_TYPE_IMAGES.support || '/event-images/support.jpg',
        'default': DEFAULT_IMAGE || '/event-images/default.jpg'
    };

    // Sélectionner l'image en fonction du type d'événement
    let fallbackImageUrl;
    if (eventType && staticImages[eventType]) {
        fallbackImageUrl = staticImages[eventType];
    } else {
        // Si le type n'est pas reconnu, utiliser l'image par défaut
        fallbackImageUrl = staticImages['default'];
    }

    console.log('Using fallback static image URL:', fallbackImageUrl);
    return [{
        url: fallbackImageUrl,
        searchQuery: eventType || 'default event',
        source: 'Image locale par défaut'
    }];
};

/**
 * Vérifie si un mot-clé est contenu dans un texte, en gérant les accents et les variations
 * @param {string} text - Le texte à analyser
 * @param {string} keyword - Le mot-clé à rechercher
 * @returns {boolean} - True si le mot-clé est trouvé, false sinon
 */
const containsKeyword = (text, keyword) => {
    if (!text || !keyword) return false;
    
    // Normaliser le texte et le mot-clé
    const normalizedText = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    
    const normalizedKeyword = keyword
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    
    // Vérifier si le mot-clé est présent dans le texte
    return normalizedText.includes(normalizedKeyword);
};

/**
 * Vérifie si les mots-clés contiennent des termes spécifiques et retourne une image correspondante
 * @param {Array<string>} keywords - Les mots-clés à vérifier
 * @param {string} title - Le titre complet de l'événement
 * @param {string} description - La description complète de l'événement
 * @returns {Promise<string|null>} - L'URL de l'image correspondante ou null si aucune correspondance
 */
async function getSpecificImageForKeywords(keywords, title = '', description = '') {
    try {
        // Vérifier d'abord les images d'artistes
        const artistName = findArtistInText(title + ' ' + description);
        if (artistName) {
            const artistImage = ARTIST_IMAGES[artistName.toLowerCase()];
            if (artistImage) {
                const isAvailable = await checkImageAvailability(artistImage);
                if (isAvailable) {
                    return artistImage;
                } else {
                    const alternativeImage = getAlternativeImage(artistName);
                    if (alternativeImage) {
                        return alternativeImage;
                    }
                }
            }
        }

        // Vérifier les images par type d'événement
        for (const [type, image] of Object.entries(EVENT_TYPE_IMAGES)) {
            if (keywords.some(keyword => containsKeyword(keyword, type))) {
                const isAvailable = await checkImageAvailability(image);
                if (isAvailable) {
                    return image;
                }
            }
        }

        // Vérifier les images par lieu
        for (const [location, image] of Object.entries(LOCATION_IMAGES)) {
            if (keywords.some(keyword => containsKeyword(keyword, location))) {
                const isAvailable = await checkImageAvailability(image);
                if (isAvailable) {
                    return image;
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Error in getSpecificImageForKeywords:', error);
        return null;
    }
}

// Fonction pour vérifier si une image est accessible
const checkImageAvailability = async (imageUrl) => {
    try {
        if (!imageUrl) return false;
        
        const response = await fetch(imageUrl, { 
            method: 'HEAD',
            headers: {
                'Accept': 'image/*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch (error) {
        console.error('Error checking image availability:', error);
        return false;
    }
};

// Fonction pour obtenir une image alternative
const getAlternativeImage = (artistName) => {
    const alternativeImages = {
        'dalida': 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg', // Image de concert
        'default': 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg' // Image de concert par défaut
    };
    return alternativeImages[artistName] || alternativeImages['default'];
};

// Améliorer la fonction findArtistInText
function findArtistInText(text) {
    if (!text) return null;

    const normalizedText = text.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlever les accents
        .replace(/[^\w\s]/g, " ") // Remplacer les caractères spéciaux par des espaces
        .replace(/\s+/g, " ") // Remplacer les espaces multiples par un seul espace
        .trim();

    // Fonction pour vérifier si un mot-clé est présent dans un texte
    const containsKeyword = (text, keyword) => {
        const normalizedText = text.toLowerCase();
        const normalizedKeyword = keyword.toLowerCase();

        // Vérifier si le mot-clé est présent tel quel
        if (normalizedText.includes(normalizedKeyword)) {
            return true;
        }

        // Vérifier les variations avec accents
        const variations = {
            'e': ['é', 'è', 'ê', 'ë'],
            'a': ['à', 'â', 'ä'],
            'i': ['î', 'ï'],
            'o': ['ô', 'ö'],
            'u': ['ù', 'û', 'ü'],
            'c': ['ç']
        };

        // Générer toutes les variations possibles du mot-clé
        const generateVariations = (word) => {
            let variations = [word];
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                if (variations[char]) {
                    const newVariations = [];
                    variations.forEach(variation => {
                        variations[char].forEach(accentedChar => {
                            newVariations.push(variation.slice(0, i) + accentedChar + variation.slice(i + 1));
                        });
                    });
                    variations = [...variations, ...newVariations];
                }
            }
            return [...new Set(variations)];
        };

        // Vérifier toutes les variations du mot-clé
        const keywordVariations = generateVariations(normalizedKeyword);
        return keywordVariations.some(variation => normalizedText.includes(variation));
    };

    // Recherche spécifique pour les artistes dans le texte
    const artistKeywords = [
        {
            name: "sabri mesbah",
            variations: [
                "sabri", "mesbah", "mesbeh", "artiste sabri", "sabri mesbeh",
                "cancer sabri", "concert sabri", "artiste sabri", "l'artiste sabri",
                "cancer l'artiste sabri", "concert l'artiste sabri"
            ]
        },
        { name: "aznavour", variations: ["charles", "charles aznavour"] },
        { name: "dalida", variations: [] },
        // Ajouter d'autres artistes selon vos besoins
    ];

    // Vérifier d'abord les correspondances exactes pour les noms complets
    for (const artist of artistKeywords) {
        if (containsKeyword(normalizedText, artist.name)) {
            console.log(`Found artist "${artist.name}" in text`);
            return artist.name;
        }
    }

    // Ensuite, vérifier les variations et les combinaisons
    for (const artist of artistKeywords) {
        // Vérifier les variations
        for (const variation of artist.variations) {
            if (containsKeyword(normalizedText, variation)) {
                console.log(`Found artist "${artist.name}" via variation "${variation}" in text`);
                return artist.name;
            }
        }

        // Pour Sabri Mesbah spécifiquement, vérifier si "sabri" et "mesbah" sont tous les deux présents
        if (artist.name === "sabri mesbah" &&
            containsKeyword(normalizedText, "sabri") &&
            (containsKeyword(normalizedText, "mesbah") || containsKeyword(normalizedText, "mesbeh"))) {
            console.log(`Found Sabri Mesbah via separate keywords in text`);
            return "sabri mesbah";
        }
    }

    return null;
}