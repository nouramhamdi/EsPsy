import axios from 'axios';
import API_CONFIG from '../config/api';

class OpenAIService {
  constructor() {
    this.recommendationApiKey = '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';
    this.translationApiKey = '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';
    this.baseURL = 'http://localhost:5000/api';
  }

  // Méthode pour obtenir des recommandations personnalisées basées sur les préférences de l'utilisateur
  async getPersonalizedRecommendations(resources, userPreferences) {
    try {
      // Préparer les données pour l'API OpenAI
      const prompt = this.buildRecommendationPrompt(resources, userPreferences);
      
      // Appeler l'API via notre backend
      const response = await axios.post(
        `${this.baseURL}/openai/recommendations`,
        {
          prompt,
          resources,
          userPreferences
        }
      );
      
      // Analyser la réponse et extraire les recommandations
      const recommendations = this.parseRecommendations(response.data.recommendations);
      
      // Mapper les recommandations aux ressources réelles
      return this.mapRecommendationsToResources(recommendations, resources);
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      // En cas d'erreur, retourner des recommandations basées sur des critères simples
      return this.getFallbackRecommendations(resources, userPreferences);
    }
  }
  
  // Construire le prompt pour l'API OpenAI
  buildRecommendationPrompt(resources, userPreferences) {
    // Créer une liste des ressources disponibles
    const resourcesList = resources.map(resource => 
      `- ${resource.title} (Type: ${resource.type}, Likes: ${resource.likesCount || 0})`
    ).join('\n');
    
    // Créer une liste des préférences de l'utilisateur
    const preferencesList = Object.entries(userPreferences)
      .map(([type, count]) => `- ${type}: ${count} likes`)
      .join('\n');
    
    return `
      Voici une liste de ressources de bien-être, méditation et thérapie:
      ${resourcesList}
      
      Les préférences de l'utilisateur sont:
      ${preferencesList}
      
      Recommandez 5 ressources qui correspondent le mieux aux préférences de l'utilisateur.
      Pour chaque ressource, indiquez son titre et une brève explication de pourquoi elle est recommandée.
      Format: "Titre: [titre de la ressource] | Raison: [raison de la recommandation]"
    `;
  }
  
  // Analyser la réponse de l'API OpenAI
  parseRecommendations(content) {
    const recommendations = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('Titre:') && line.includes('Raison:')) {
        const [titlePart, reasonPart] = line.split('|');
        const title = titlePart.replace('Titre:', '').trim();
        const reason = reasonPart.replace('Raison:', '').trim();
        
        recommendations.push({ title, reason });
      }
    }
    
    return recommendations;
  }
  
  // Mapper les recommandations aux ressources réelles
  mapRecommendationsToResources(recommendations, resources) {
    return recommendations.map(rec => {
      const resource = resources.find(r => r.title === rec.title);
      if (resource) {
        return {
          ...resource,
          recommendationReason: rec.reason
        };
      }
      return null;
    }).filter(Boolean);
  }
  
  // Méthode de secours en cas d'erreur de l'API
  getFallbackRecommendations(resources, userPreferences) {
    // Filtrer les ressources non bloquées
    const availableResources = resources.filter(resource => !resource.isBlocked);
    
    // Calculer un score pour chaque ressource
    const scoredResources = availableResources.map(resource => {
      let score = 0;
      
      // Score basé sur les likes
      score += (resource.likesCount || 0) * 2;
      
      // Score basé sur les préférences de l'utilisateur
      if (userPreferences[resource.type]) {
        score += userPreferences[resource.type] * 3;
      }
      
      return {
        ...resource,
        recommendationScore: score,
        recommendationReason: `Recommandé basé sur vos préférences pour le type "${resource.type}" et sa popularité.`
      };
    });
    
    // Trier par score et prendre les 5 meilleures
    return scoredResources
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 5);
  }

  // Méthode pour traduire du contenu
  async translateContent(content, targetLanguage) {
    try {
      console.log('Début de la traduction - Contenu reçu:', content);
      console.log('Langue cible:', targetLanguage);

      const response = await axios.post(
        `${this.baseURL}/translate`,
        {
          content,
          targetLanguage
        }
      );
      
      console.log('Réponse du backend:', response.data);
      
      if (typeof content === 'object') {
        if (!response.data || !response.data.title || !response.data.description) {
          throw new Error('Invalid response format from backend for object');
        }
        return {
          title: response.data.title,
          description: response.data.description
        };
      } else {
        if (!response.data || !response.data.translated) {
          throw new Error('Invalid response format from backend for text');
        }
        return response.data.translated;
      }
    } catch (error) {
      console.error('Detailed error during translation:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
}

export default new OpenAIService(); 