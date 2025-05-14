import React, { useState, useEffect, useRef } from 'react';
import resourceServices from '../../Services/ResourceService';
import openAIService from '../../Services/OpenAIService';
import { useNavigate } from 'react-router-dom';

function Resources() {
  const [resources, setResources] = useState([]);
  const [recommendedResources, setRecommendedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [translatedContent, setTranslatedContent] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [highlightedResourceId, setHighlightedResourceId] = useState(null);
  const resourcesRef = useRef({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likes, setLikes] = useState({});
  const [favorites, setFavorites] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResources, setFilteredResources] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en'); // 'en' pour anglais, 'fr' pour français
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"))
  const navigate = useNavigate();

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fonction pour traduire le type de ressource
  const translateType = (type) => {
    const typeTranslations = {
      'meditation': {
        en: 'Meditation',
        fr: 'Méditation'
      },
      'therapy': {
        en: 'Therapy',
        fr: 'Thérapie'
      },
      'well-being': {
        en: 'Well-being',
        fr: 'Bien-être'
      }
    };
    return typeTranslations[type]?.[currentLanguage] || type;
  };

  // Fonction pour traduire le contenu d'une ressource
  const translateResource = (resource) => {
    if (!resource) return resource;

    // Si la ressource a déjà des traductions, les utiliser
    if (resource.translations && resource.translations[currentLanguage]) {
      return {
        ...resource,
        title: resource.translations[currentLanguage].title || resource.title,
        description: resource.translations[currentLanguage].description || resource.description,
        type: translateType(resource.type)
      };
    }

    // Sinon, utiliser le contenu original
    return {
      ...resource,
      type: translateType(resource.type)
    };
  };

  // Fonction pour récupérer les favoris de l'utilisateur
  const fetchUserFavorites = async () => {
    try {
      if (!loggedUser) {
        setFavorites({});
        return;
      }

      const userFavorites = await resourceServices.getUserFavorites();
      console.log("User favorites:", userFavorites);

      // Créer un objet avec les IDs des ressources favorites
      const favoriteIds = {};
      userFavorites.forEach(resource => {
        favoriteIds[resource._id] = {
          count: resource.favoritesCount || 0,
          isFavorited: true
        };
      });

      setFavorites(prev => ({
        ...prev,
        ...favoriteIds
      }));
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      setFavorites({});
    }
  };

  // Fonction pour basculer entre les langues
  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'en' ? 'fr' : 'en');
  };

  // Fonction pour obtenir le texte dans la langue actuelle
  const getText = (enText, frText) => {
    return currentLanguage === 'en' ? enText : frText;
  };

  // Fonction pour calculer les préférences de l'utilisateur
  const calculateUserPreferences = (resources) => {
    if (!loggedUser) return {};

    const preferences = {
      'meditation': 0,
      'therapy': 0,
      'well-being': 0
    };

    // Calculer les préférences basées sur les likes
    resources.forEach(resource => {
      if (resource.likes && resource.likes.includes(loggedUser._id)) {
        preferences[resource.type] = (preferences[resource.type] || 0) + 2; // Augmenter le poids des likes
      }
    });

    // Ajouter un bonus pour les ressources favorites
    resources.forEach(resource => {
      if (favorites[resource._id]?.isFavorited) {
        preferences[resource.type] = (preferences[resource.type] || 0) + 3; // Augmenter le poids des favoris
      }
    });

    // Ajouter un bonus pour les ressources récemment consultées
    const recentViews = JSON.parse(localStorage.getItem('recentViews') || '[]');
    recentViews.forEach(view => {
      const resource = resources.find(r => r._id === view.resourceId);
      if (resource) {
        preferences[resource.type] = (preferences[resource.type] || 0) + 1;
      }
    });

    // Normaliser les scores
    const total = Object.values(preferences).reduce((sum, score) => sum + score, 0);
    if (total > 0) {
      Object.keys(preferences).forEach(type => {
        preferences[type] = (preferences[type] / total) * 100;
      });
    }

    return preferences;
  };

  // Fonction pour obtenir les recommandations basées sur l'IA
  const fetchAIRecommendations = async (allResources) => {
    if (!allResources.length || !loggedUser) return;

    try {
      setRecommendationsLoading(true);

      // Calculer les préférences de l'utilisateur
      const userPreferences = calculateUserPreferences(allResources);

      // Filtrer les ressources déjà likées ou favorites
      const availableResources = allResources.filter(resource =>
        !resource.likes?.includes(loggedUser._id) &&
        !favorites[resource._id]?.isFavorited
      );

      // Obtenir les recommandations personnalisées via l'API OpenAI
      const recommendations = await openAIService.getPersonalizedRecommendations(
        availableResources,
        userPreferences
      );

      // Trier les recommandations par score de préférence
      const sortedRecommendations = recommendations
        .map(resource => ({
          ...resource,
          preferenceScore: userPreferences[resource.type] || 0
        }))
        .sort((a, b) => b.preferenceScore - a.preferenceScore);

      setRecommendedResources(sortedRecommendations);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      // En cas d'erreur, utiliser les recommandations basées sur des critères simples
      const fallbackRecommendations = getFallbackRecommendations(allResources);
      setRecommendedResources(fallbackRecommendations);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // Fonction de secours pour les recommandations basées sur des critères simples
  const getFallbackRecommendations = (allResources) => {
    if (!allResources.length) return [];

    const userPreferences = calculateUserPreferences(allResources);

    // Calculer un score pour chaque ressource
    const scoredResources = allResources
      .filter(resource =>
        !resource.isBlocked &&
        !resource.likes?.includes(loggedUser._id) &&
        !favorites[resource._id]?.isFavorited
      )
      .map(resource => {
        let score = 0;

        // Score basé sur les préférences de l'utilisateur
        if (userPreferences[resource.type]) {
          score += userPreferences[resource.type] * 2;
        }

        // Score basé sur la popularité
        score += (resource.likesCount || 0) * 0.5;
        score += (resource.favoritesCount || 0) * 0.3;

        return {
          ...resource,
          recommendationScore: score,
          recommendationReason: `Recommended based on your preferences for type "${resource.type}" and its popularity.`
        };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 5);

    return scoredResources;
  };

  // Modifier la fonction fetchResources pour ne pas charger automatiquement les recommandations
  const fetchResources = async () => {
    try {
      setLoading(true);
      console.log("Fetching resources...");
      console.log("Logged user:", loggedUser);

      // Récupérer les ressources
      const resourcesResponse = await resourceServices.getResources();
      console.log("Resources response:", resourcesResponse);

      // Filtrer les ressources bloquées et non accessibles aux étudiants
      const accessibleResources = resourcesResponse.filter(resource => {
        // Si la ressource est bloquée, ne pas l'afficher
        if (resource.isBlocked) return false;

        // Si l'utilisateur est un étudiant, vérifier les restrictions
        if (loggedUser && loggedUser.role === 'student') {
          // Vérifier si la ressource a des restrictions
          if (resource.restrictions) {
            // Si la ressource est restreinte aux étudiants, l'afficher
            return resource.restrictions.includes('student');
          }
          // Si pas de restrictions, afficher la ressource
          return true;
        }

        // Pour les autres rôles, afficher toutes les ressources non bloquées
        return true;
      });

      console.log("Accessible resources:", accessibleResources);

      // Récupérer les favoris si l'utilisateur est connecté
      let favoritesResponse = [];
      if (loggedUser) {
        try {
          favoritesResponse = await resourceServices.getUserFavorites();
          console.log("User favorites:", favoritesResponse);
        } catch (error) {
          console.error('Error fetching favorites:', error);
        }
      }

      // Initialiser les états des likes et favoris
      const newLikes = {};
      const newFavorites = {};

      // Créer un Set des IDs des ressources favorites pour une recherche plus rapide
      const favoriteIds = new Set(favoritesResponse.map(resource => resource._id));

      accessibleResources.forEach(resource => {
        const isLikedByUser = loggedUser && resource.likes && resource.likes.includes(loggedUser._id);
        newLikes[resource._id] = {
          count: resource.likesCount || 0,
          isLiked: isLikedByUser || false
        };

        const isFavoritedByUser = favoriteIds.has(resource._id);
        newFavorites[resource._id] = {
          count: resource.favoritesCount || 0,
          isFavorited: isFavoritedByUser
        };
      });

      setLikes(newLikes);
      setFavorites(newFavorites);
      setResources(accessibleResources);
      setHasMore(accessibleResources.length > ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching resources:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      setResources([]);
      setRecommendedResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Resources component mounted");
    fetchResources();
    fetchUserFavorites();
  }, [page]);

  useEffect(() => {
    let filtered = [...resources];

    // Filtrer les ressources bloquées
    filtered = filtered.filter(resource => !resource.isBlocked);

    // Filtre par titre si searchTerm existe
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par type si un type est sélectionné
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    // Filtre pour n'afficher que les favoris si showFavorites est true
    if (showFavorites) {
      filtered = filtered.filter(resource => favorites[resource._id]?.isFavorited);
    }

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    setHasMore(currentPage < totalPages);

    // Appliquer la pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedResources = filtered.slice(startIndex, endIndex);

    // Traduire les ressources filtrées et paginées
    const translatedResources = paginatedResources.map(translateResource);

    setFilteredResources(translatedResources);
  }, [searchTerm, resources, selectedType, currentPage, showFavorites, favorites, currentLanguage]);

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'meditation':
        return 'bg-blue-100 text-blue-600';
      case 'therapy':
        return 'bg-green-100 text-green-600';
      case 'well-being':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleOpen = (resource) => {
    setSelectedResource(resource);
    setTranslatedContent(null);
  };

  const handleClose = () => {
    setSelectedResource(null);
    setTranslatedContent(null);
  };

  const handleLike = async (resourceId) => {
    // Vérifier si l'utilisateur est connecté
    const user = JSON.parse(localStorage.getItem("loggedUser"));
    if (!user || !user._id) {
      // Rediriger vers la page de connexion avec un message
      alert('Veuillez vous connecter pour liker une ressource');
      navigate('/login');
      return;
    }

    // Sauvegarder l'état précédent
    const previousLikes = { ...likes };

    try {
      // Mise à jour optimiste
      setLikes(prev => ({
        ...prev,
        [resourceId]: {
          count: prev[resourceId].isLiked ? prev[resourceId].count - 1 : prev[resourceId].count + 1,
          isLiked: !prev[resourceId].isLiked
        }
      }));

      // Appel API avec l'ID de l'utilisateur
      const response = await resourceServices.likeResource(resourceId, user._id);

      if (!response || response.error) {
        throw new Error(response?.error || 'Erreur lors du like');
      }

      // Mise à jour avec la réponse du serveur
      setLikes(prev => ({
        ...prev,
        [resourceId]: {
          count: response.likes,
          isLiked: response.isLiked
        }
      }));

      // Mettre à jour le compteur de likes dans la liste des ressources
      setResources(prevResources =>
        prevResources.map(resource =>
          resource._id === resourceId
            ? { ...resource, likesCount: response.likes }
            : resource
        )
      );
    } catch (error) {
      console.error('Error liking resource:', error);

      // Restaurer l'état précédent en cas d'erreur
      setLikes(previousLikes);

      // Gestion spécifique des erreurs 401
      if (error.response?.status === 401) {
        // Supprimer les données de l'utilisateur expirées
        localStorage.removeItem("loggedUser");
        alert('Votre session a expiré. Veuillez vous reconnecter.');
        navigate('/login');
        return;
      }

      // Afficher un message d'erreur plus spécifique
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue lors du like. Veuillez réessayer.';
      alert(errorMessage);
    }
  };

  const handleFavorite = async (resourceId) => {
    try {
      if (!loggedUser) {
        navigate('/login');
        return;
      }

      const response = await resourceServices.favoriteResource(resourceId);

      // Mettre à jour l'état des favoris
      setFavorites(prev => ({
        ...prev,
        [resourceId]: {
          count: response.favorites,
          isFavorited: response.isFavorited
        }
      }));

      // Mettre à jour la liste des ressources
      setResources(prev =>
        prev.map(resource =>
          resource._id === resourceId
            ? { ...resource, favoritesCount: response.favorites }
            : resource
        )
      );

      // Rafraîchir la liste des favoris
      await fetchUserFavorites();
    } catch (error) {
      console.error('Error favoriting resource:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      console.log('Searching for:', searchTerm);
      const results = await resourceServices.searchResources(searchTerm);
      console.log('Search results:', results);
      setResources(results);
    } catch (error) {
      console.error('Error searching resources:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const resetSearch = async () => {
    setSearchTerm('');
    setIsSearching(false);
    fetchResources();
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const getPaginationNumbers = () => {
    let filtered = [...resources];

    // Appliquer les mêmes filtres que dans le useEffect
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    if (showFavorites) {
      filtered = filtered.filter(resource => favorites[resource._id]?.isFavorited);
    }

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Fonction pour activer/désactiver les recommandations
  const toggleRecommendations = () => {
    setShowRecommendations(!showRecommendations);
    if (!showRecommendations) {
      fetchAIRecommendations(resources);
    }
  };

  // Fonction pour naviguer vers une ressource dans la liste principale
  const navigateToResource = (resourceId) => {
    // Trouver l'index de la ressource dans la liste complète des ressources
    const resourceIndex = resources.findIndex(resource => resource._id === resourceId);

    if (resourceIndex !== -1) {
      // Calculer la page contenant cette ressource
      const pageContainingResource = Math.floor(resourceIndex / ITEMS_PER_PAGE) + 1;

      // Si la ressource n'est pas sur la page actuelle, changer de page
      if (pageContainingResource !== currentPage) {
        setCurrentPage(pageContainingResource);
      }

      // Mettre en évidence la ressource
      setHighlightedResourceId(resourceId);

      // Faire défiler jusqu'à la ressource après un court délai pour permettre le rendu
      setTimeout(() => {
        const element = resourcesRef.current[resourceId];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Retirer la mise en évidence après quelques secondes
          setTimeout(() => {
            setHighlightedResourceId(null);
          }, 3000);
        }
      }, 100);
    }
  };

  // Fonction pour traduire le contenu
  const translateContent = async (content, targetLanguage) => {
    try {
      console.log('Appel de translateContent dans Resources:', { content, targetLanguage });
      setIsTranslating(true);

      // Préparer le contenu pour la traduction
      const contentToTranslate = {
        title: content.title,
        description: content.description
      };

      const translatedText = await openAIService.translateContent(contentToTranslate, targetLanguage);
      console.log('Résultat de la traduction:', translatedText);

      // Mettre à jour l'état avec la traduction
      setTranslatedContent(translatedText);

      return translatedText;
    } catch (error) {
      console.error('Erreur détaillée dans Resources:', error);
      throw error;
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <section id="resources" className="section">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-4">{getText('Resources', 'Ressources')}</h2>
          <div className="flex justify-center items-center gap-4">
            <button
              className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                showRecommendations
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-blue-500 text-blue-500 hover:bg-blue-100'
              }`}
              onClick={toggleRecommendations}
            >
              <i className={`fas ${showRecommendations ? 'fa-eye-slash' : 'fa-eye'} mr-2`}></i>
              {showRecommendations
                ? getText('Hide Recommendations', 'Masquer les recommandations')
                : getText('Show Recommendations', 'Afficher les recommandations')}
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                showFavorites
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-blue-500 text-blue-500 hover:bg-blue-100'
              }`}
              onClick={() => {
                setShowFavorites(!showFavorites);
                setCurrentPage(1);
              }}
            >
              <i className={`fas ${showFavorites ? 'fa-star' : 'fa-star-o'} mr-2`}></i>
              {showFavorites ? getText('All contents', 'Tout le contenu') : getText('My Favorites', 'Mes favoris')}
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-white border border-blue-500 text-blue-500 hover:bg-blue-100 transition-colors duration-300"
              onClick={toggleLanguage}
              title={currentLanguage === 'en' ? 'Switch to French' : 'Passer en anglais'}
            >
              <i className="fas fa-language mr-1"></i>
              {currentLanguage === 'en' ? 'FR' : 'EN'}
            </button>
          </div>
        </div>
</div>
      {showRecommendations ? (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">{getText('Recommended Resources', 'Ressources Recommandées')}</h3>
          {recommendationsLoading ? (
            <div className="flex justify-center my-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : recommendedResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {recommendedResources.map(resource => (
                <div
                  key={resource._id}
                  ref={el => resourcesRef.current[resource._id] = el}
                  className="flex justify-center"
                >
                  <div className={`p-3 hover:shadow-lg transition-shadow duration-300 rounded-lg max-w-sm w-full ${
                    highlightedResourceId === resource._id
                      ? 'transform scale-105 shadow-lg border-2 border-blue-500'
                      : 'border border-gray-200'
                  }`}>
                    <div className="relative h-52 mb-4 overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center">
                      {resource.urifiles && resource.urifiles.length > 0 && resource.urifiles[0].startsWith('/uploads/images') ? (
                        <img
                          src={`https://espsy.onrender.com${resource.urifiles[0]}`}
                          alt={resource.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400">Pas d'image</span>
                      )}
                    </div>

                    <div className="px-5 py-3">
                      <div className="flex justify-between items-center space-x-6 mb-3">
                        <div className="flex gap-2 flex-nowrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                            resource.type === 'meditation'
                              ? 'bg-blue-100 text-blue-600'
                              : resource.type === 'therapy'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {translateType(resource.type)}
                          </span>
                      
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                          <button
                            className={`px-2 py-1 rounded-full text-sm ${
                              likes[resource._id]?.isLiked
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                            }`}
                            onClick={() => handleLike(resource._id)}
                            title={likes[resource._id]?.isLiked ? getText("Remove your like", "Retirer votre like") : getText("Add a like", "Ajouter un like")}
                          >
                            <i className="fas fa-heart mr-1"></i>
                            {likes[resource._id]?.count || 0}
                          </button>
                          <span className="px-2 py-1 rounded-full text-sm bg-yellow-100 text-yellow-600">
                            <i className="fas fa-star mr-1"></i>
                            {favorites[resource._id]?.count || 0}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-semibold mb-1 text-navy-700 dark:text-white line-clamp-1">
                        {translateResource(resource).title}
                      </h3>

                      <p className="mb-2 text-sm text-gray-600 line-clamp-2">
                        {translateResource(resource).description}
                      </p>

                      <div className="mb-2 text-xs text-gray-500">
                        <p className="mb-1">
                          <i className="fas fa-calendar-alt mr-1"></i>
                          {formatDate(resource.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleOpen(resource)}
                          data-bs-toggle="modal"
                          data-bs-target="#resourceModal"
                          className="px-5 py-2.5 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 shadow-md"
                        >
                          {getText('View Details', 'Voir détails')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              {getText('No recommendations available', 'Aucune recommandation disponible')}
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Filtres et recherche */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder={getText('Search by title...', 'Rechercher par titre...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">{getText('All Types', 'Tous les types')}</option>
              <option value="meditation">{getText('Meditation', 'Méditation')}</option>
              <option value="therapy">{getText('Therapy', 'Thérapie')}</option>
              <option value="well-being">{getText('Well-being', 'Bien-être')}</option>
            </select>
          </div>

          {/* Liste des ressources */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {filteredResources.map((resource) => (
              <div
                key={resource._id}
                ref={el => resourcesRef.current[resource._id] = el}
                className="flex justify-center"
              >
                <div className={`p-3 hover:shadow-lg transition-shadow duration-300 rounded-lg max-w-sm w-full ${
                  highlightedResourceId === resource._id
                    ? 'transform scale-105 shadow-lg border-2 border-blue-500'
                    : 'border border-gray-200'
                }`}>
                  <div className="relative h-52 mb-4 overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center">
                    {resource.urifiles && resource.urifiles.length > 0 && resource.urifiles[0].startsWith('/uploads/images') ? (
                      <img
                        src={`https://espsy.onrender.com${resource.urifiles[0]}`}
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">Pas d'image</span>
                    )}
                  </div>

                  <div className="px-5 py-3">
                    <div className="flex justify-between items-center space-x-6 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                        resource.type === 'meditation'
                          ? 'bg-blue-100 text-blue-600'
                          : resource.type === 'therapy'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </span>
                      <div className="flex gap-3 flex-shrink-0">
                        <button
                          className={`px-2 py-1 rounded-full text-sm ${
                            likes[resource._id]?.isLiked
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                          }`}
                          onClick={() => handleLike(resource._id)}
                          title={likes[resource._id]?.isLiked ? getText("Remove your like", "Retirer votre like") : getText("Add a like", "Ajouter un like")}
                        >
                          <i className="fas fa-heart mr-1"></i>
                          {likes[resource._id]?.count || 0}
                        </button>
                        <span className="px-2 py-1 rounded-full text-sm bg-yellow-100 text-yellow-600">
                          <i className="fas fa-star mr-1"></i>
                          {favorites[resource._id]?.count || 0}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-semibold mb-1 text-navy-700 dark:text-white line-clamp-1">
                      {resource.title}
                    </h3>

                    <p className="mb-2 text-sm text-gray-600 line-clamp-2">
                      {resource.description}
                    </p>

                    <div className="mb-2 text-xs text-gray-500">
                      <p className="mb-1">
                        <i className="fas fa-calendar-alt mr-1"></i>
                        {formatDate(resource.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleOpen(resource)}
                        data-bs-toggle="modal"
                        data-bs-target="#resourceModal"
                        className="px-5 py-2.5 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 shadow-md"
                      >
                        {getText('View Details', 'Voir détails')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {!isSearching && (
            <div className="flex flex-col items-center mt-6 mb-4">
              <div className="flex justify-center items-center space-x-2 mb-1">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded text-sm flex items-center ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  <i className="fas fa-chevron-left mr-1 text-xs"></i>
                  {getText('Prev', 'Préc')}
                </button>

                <div className="flex space-x-1 mx-1">
                  {getPaginationNumbers().map((number) => (
                    <button
                      key={number}
                      onClick={() => handlePageChange(number)}
                      className={`w-7 h-7 flex items-center justify-center rounded text-sm transition-colors duration-200 ${
                        currentPage === number
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const totalPages = Math.ceil(resources.length / ITEMS_PER_PAGE);
                    handlePageChange(Math.min(totalPages, currentPage + 1));
                  }}
                  disabled={currentPage >= Math.ceil(resources.length / ITEMS_PER_PAGE)}
                  className={`px-3 py-1.5 rounded text-sm flex items-center ${
                    currentPage >= Math.ceil(resources.length / ITEMS_PER_PAGE)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {getText('Next', 'Suiv')}
                  <i className="fas fa-chevron-right ml-1 text-xs"></i>
                </button>
              </div>

              <div className="text-sm text-gray-500">
                {getText('Page', 'Page')} {currentPage} {getText('of', 'sur')} {Math.ceil(resources.length / ITEMS_PER_PAGE)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <div
        className="modal fade"
        id="resourceModal"
        tabIndex="-1"
        aria-labelledby="resourceModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content bg-white rounded-lg shadow-xl">
            {selectedResource && (
              <>
                <div className="flex justify-between items-center p-4 border-b">
                  <h5 className="text-xl font-semibold" id="resourceModalLabel">
                    {translatedContent?.title || selectedResource.title}
                  </h5>
                  <div className="flex items-center gap-4">
                    <select
                      className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                      onChange={(e) => translateContent(selectedResource, e.target.value)}
                      disabled={isTranslating}
                    >
                      <option value="">Sélectionner une langue</option>
                      <option value="en">Anglais</option>
                      <option value="fr">Français</option>
                      <option value="es">Espagnol</option>
                      <option value="de">Allemand</option>
                      <option value="it">Italien</option>
                      <option value="pt">Portugais</option>
                    </select>
                    <button
                      type="button"
                      className="text-gray-500 hover:text-gray-700"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      onClick={handleClose}
                    >
                      <i className="fas fa-times text-xl"></i>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {isTranslating ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                      <p className="mt-4 text-gray-600">Traduction en cours...</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-4">{translatedContent?.title || selectedResource.title}</h2>
                        <p className="text-gray-600 leading-relaxed">{translatedContent?.description || selectedResource.description}</p>
                      </div>

                      {selectedResource.urifiles && selectedResource.urifiles.length > 0 && (
                        <div className="mb-6">
                          <h6 className="text-gray-500 font-semibold mb-3">Fichiers joints :</h6>
                          <div className="grid grid-cols-1 gap-4">
                            {selectedResource.urifiles.map((file, index) => {
                              // Déterminer le type de fichier à partir de l'extension
                              let fileType;
                              if (file.startsWith('/uploads/images')) {
                                fileType = 'image';
                              } else if (file.endsWith('.mp4') || file.endsWith('.avi') || file.endsWith('.mov')) {
                                fileType = 'video';
                              } else if (file.endsWith('.mp3') || file.endsWith('.wav')) {
                                fileType = 'audio';
                              } else if (file.endsWith('.pdf')) {
                                fileType = 'pdf';
                              } else {
                                fileType = 'other';
                              }

                              const fileUrl = `https://espsy.onrender.com${file}`;

                              switch (fileType) {
                                case 'image':
                                  return (
                                    <div key={index} className="mb-3">
                                      <img
                                        src={fileUrl}
                                        alt="Image"
                                        className="rounded-lg max-h-[300px] object-contain"
                                      />
                                    </div>
                                  );
                                case 'video':
                                  return (
                                    <div key={index} className="mb-3">
                                      <video controls className="w-full rounded-lg max-h-[300px]">
                                        <source src={fileUrl} type="video/mp4" />
                                        {getText('Your browser does not support video playback.', 'Votre navigateur ne prend pas en charge la lecture vidéo.')}
                                      </video>
                                    </div>
                                  );
                                case 'audio':
                                  return (
                                    <div key={index} className="mb-3">
                                      <audio controls className="w-full">
                                        <source src={fileUrl} type="audio/mpeg" />
                                        {getText('Your browser does not support audio playback.', 'Votre navigateur ne prend pas en charge la lecture audio.')}
                                      </audio>
                                    </div>
                                  );
                                case 'pdf':
                                  return (
                                    <div key={index} className="mb-3">
                                      <div className="flex items-center">
                                        <i className="fas fa-file-pdf text-red-500 mr-2 text-xl"></i>
                                        <a
                                          href={fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-3 py-1 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50"
                                        >
                                          {getText('View PDF', 'Voir le PDF')}
                                        </a>
                                      </div>
                                    </div>
                                  );
                                default:
                                  return (
                                    <div key={index} className="mb-3">
                                      <div className="flex items-center">
                                        <i className="fas fa-file mr-2 text-xl"></i>
                                        <a
                                          href={fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-3 py-1 border border-gray-500 text-gray-500 rounded-lg hover:bg-gray-50"
                                        >
                                          {getText('Download File', 'Télécharger le fichier')}
                                        </a>
                                      </div>
                                    </div>
                                  );
                              }
                            })}
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <h6 className="text-gray-500 font-semibold mb-2">Type :</h6>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          selectedResource.type === 'meditation'
                            ? 'bg-blue-100 text-blue-600'
                            : selectedResource.type === 'therapy'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {translatedContent?.type || selectedResource.type}
                        </span>
                      </div>

                      <div className="mb-6">
                        <h6 className="text-gray-500 font-semibold mb-2">Published on :</h6>
                        <p className="text-gray-600">{formatDate(selectedResource.createdAt)}</p>
                      </div>

                      <div className="flex gap-4">
                        <button
                          className={`px-4 py-2 rounded-lg transition-colors duration-300 flex items-center ${
                            likes[selectedResource._id]?.isLiked
                              ? 'bg-red-500 text-white'
                              : 'border border-red-500 text-red-500 hover:bg-red-50'
                          }`}
                          onClick={() => handleLike(selectedResource._id)}
                        >
                          <i className="fas fa-heart mr-2"></i>
                          {likes[selectedResource._id]?.isLiked ? "Unlike" : "Like"} ({likes[selectedResource._id]?.count || 0})
                        </button>

                        <button
                          className={`px-4 py-2 rounded-lg transition-colors duration-300 flex items-center ${
                            favorites[selectedResource._id]?.isFavorited
                              ? 'bg-yellow-500 text-white'
                              : 'border border-yellow-500 text-yellow-500 hover:bg-yellow-50'
                          }`}
                          onClick={() => handleFavorite(selectedResource._id)}
                        >
                          <i className="fas fa-star mr-2"></i>
                          {favorites[selectedResource._id]?.isFavorited ? "Remove from favorites" : "Add to favorites"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Resources;