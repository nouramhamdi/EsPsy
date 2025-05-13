/**
 * Service pour rechercher des images sur Google
 */

import { GOOGLE_API_KEY, GOOGLE_CX } from '../config/api-keys';

/**
 * Recherche des images sur Google en fonction d'une requête
 * @param {string} query - La requête de recherche
 * @returns {Promise<Array>} - Un tableau d'URLs d'images
 */
export const searchImagesOnGoogle = async (query) => {
    try {
        console.log('Searching images on Google for:', query);

        // Vérifier si les clés API sont disponibles
        if (GOOGLE_API_KEY === 'AIzaSyDJxTw-ORlJIWrQ9LvQJp7AMuXgpQslk-0' || GOOGLE_CX === '017576662512468239146:omuauf_lfve') {
            console.log('Using default API keys, switching to alternative approach');
            return await searchImagesAlternative(query);
        }

        // Construire l'URL de l'API Google Custom Search
        const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&searchType=image&num=1`;

        // Appeler l'API
        const response = await fetch(url);
        const data = await response.json();

        // Vérifier si des résultats ont été trouvés
        if (data.items && data.items.length > 0) {
            // Extraire les URLs des images et les descriptions
            const imageResults = data.items.map(item => ({
                url: item.link,
                title: item.title || 'No title',
                snippet: item.snippet || 'No description',
                source: item.displayLink || 'Google Search'
            }));

            console.log('Found images from Google:', imageResults);

            // Afficher une description détaillée de chaque image
            imageResults.forEach((img, index) => {
                console.log(`Image ${index + 1} details:`);
                console.log(`- URL: ${img.url}`);
                console.log(`- Title: ${img.title}`);
                console.log(`- Description: ${img.snippet}`);
                console.log(`- Source: ${img.source}`);
            });

            // Retourner les URLs des images
            return imageResults.map(img => img.url);
        }

        console.log('No images found on Google, trying alternative approach');
        return await searchImagesAlternative(query);
    } catch (error) {
        console.error('Error searching images on Google:', error);
        return await searchImagesAlternative(query);
    }
};

/**
 * Recherche des images en utilisant une approche alternative
 * @param {string} query - La requête de recherche
 * @returns {Promise<Array>} - Un tableau d'URLs d'images
 */
const searchImagesAlternative = async (query) => {
    try {
        console.log('Searching images with alternative approach for:', query);

        // Utiliser Unsplash comme alternative
        const timestamp = Date.now();
        const randomSeed = Math.floor(Math.random() * 10000);
        const unsplashUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}&t=${timestamp}&r=${randomSeed}`;

        // Vérifier si l'URL est accessible
        try {
            const response = await fetch(unsplashUrl, { method: 'HEAD' });
            if (response.ok) {
                console.log('Found image on Unsplash:', unsplashUrl);
                console.log('Image details:');
                console.log(`- URL: ${unsplashUrl}`);
                console.log(`- Title: Image from Unsplash for query "${query}"`);
                console.log(`- Description: Random high-quality image from Unsplash related to: ${query}`);
                console.log(`- Source: Unsplash`);
                return [unsplashUrl];
            }
        } catch (error) {
            console.error('Error with Unsplash:', error);
        }

        // Si Unsplash échoue, essayer avec une autre approche
        // Utiliser des images spécifiques pour certains mots-clés
        const keywords = query.toLowerCase().split(' ');

        // Dictionnaire de mots-clés et leurs images correspondantes
        const keywordImages = {
            // Artistes
            'sabri': 'https://images.pexels.com/photos/7594437/pexels-photo-7594437.jpeg', // Chanteur sur scène
            'mesbah': 'https://images.pexels.com/photos/7594437/pexels-photo-7594437.jpeg', // Chanteur sur scène
            'mesbeh': 'https://images.pexels.com/photos/7594437/pexels-photo-7594437.jpeg', // Chanteur sur scène
            'kendji': 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg', // Chanteur avec guitare
            'girac': 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg', // Chanteur avec guitare
            'dalida': 'https://images.pexels.com/photos/7061416/pexels-photo-7061416.jpeg', // Chanteuse
            'aznavour': 'https://images.pexels.com/photos/4406759/pexels-photo-4406759.jpeg', // Chanteur âgé
            'concert': 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
            'cancer': 'https://images.pexels.com/photos/3900424/pexels-photo-3900424.jpeg',
            'artiste': 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
            'music': 'https://images.pexels.com/photos/1001850/pexels-photo-1001850.jpeg',
            'camping': 'https://images.pexels.com/photos/6271625/pexels-photo-6271625.jpeg',
            'beach': 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg',
            'yoga': 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg',
            'meditation': 'https://images.pexels.com/photos/3094230/pexels-photo-3094230.jpeg',
            'sport': 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg',
            'food': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
            'dance': 'https://images.pexels.com/photos/2188012/pexels-photo-2188012.jpeg',
            'art': 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg',
            'conference': 'https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg',
            'workshop': 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
            'therapy': 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg',
            'seminar': 'https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg',
            'social': 'https://images.pexels.com/photos/5324913/pexels-photo-5324913.jpeg',
            'support': 'https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg',

            // Lieux en Tunisie
            'tunis': 'https://images.pexels.com/photos/3254729/pexels-photo-3254729.jpeg',
            'nabeul': 'https://images.pexels.com/photos/4388167/pexels-photo-4388167.jpeg',
            'hammamet': 'https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg',
            'sousse': 'https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg',
            'monastir': 'https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg',
            'djerba': 'https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg',
            'sfax': 'https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg',
            'carthage': 'https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg',
            'sidi bou said': 'https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg',

            // Types d'événements spécifiques
            'festival': 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
            'exposition': 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg',
            'vernissage': 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg',
            'gala': 'https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg',
            'soirée': 'https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg',
            'conférence': 'https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg',
            'atelier': 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
            'thérapie': 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg',
            'séminaire': 'https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg',
            'formation': 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg'
        };

        // Vérifier si l'un des mots-clés correspond à une image spécifique
        for (const keyword of keywords) {
            if (keywordImages[keyword]) {
                const imageUrl = keywordImages[keyword];
                console.log(`Found specific image for keyword "${keyword}":`, imageUrl);
                console.log('Image details:');
                console.log(`- URL: ${imageUrl}`);
                console.log(`- Title: Image for keyword "${keyword}"`);
                console.log(`- Description: Predefined image for the keyword "${keyword}" found in query: "${query}"`);
                console.log(`- Source: Predefined dictionary`);
                return [imageUrl];
            }
        }

        // Si aucune correspondance n'est trouvée, utiliser une image par défaut
        const defaultImageUrl = 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg';
        console.log('No specific image found, using default image:', defaultImageUrl);
        console.log('Image details:');
        console.log(`- URL: ${defaultImageUrl}`);
        console.log(`- Title: Default event image`);
        console.log(`- Description: Default image used when no specific image could be found for query: "${query}"`);
        console.log(`- Source: Pexels (default)`);
        return [defaultImageUrl];
    } catch (error) {
        console.error('Error searching images with alternative approach:', error);
        return ['https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg'];
    }
};
