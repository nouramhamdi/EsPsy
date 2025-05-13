const Resource = require("../Models/resourceModel");

// Ajouter Resource 
const addResource = async (req, res) => {
  try {
    // 1. Vérifier les données
    const { title, description, type } = req.body;
    if (!title || !description || !type) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    // Validation de la description
    if (description.length < 50 || description.length > 500) {
      return res.status(400).json({
        error: `La description doit contenir entre 50 et 500 caractères. Actuel: ${description.length} caractères`
      });
    }

    // 2. Traiter les fichiers uploadés
    const urifiles = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        let uploadPath = '';
        if (file.mimetype.startsWith('image/')) uploadPath = 'images/';
        else if (file.mimetype.startsWith('video/')) uploadPath = 'videos/';
        else if (file.mimetype.startsWith('audio/')) uploadPath = 'audios/';
        else if (file.mimetype === 'application/pdf') uploadPath = 'pdfs/';
        
        urifiles.push(`/uploads/${uploadPath}${file.filename}`);
      });
    }

    // 3. Créer et sauvegarder la ressource
    const resource = new Resource({
      title,
      description,
      type,
      urifiles,
      createdBy: req.user ? req.user._id : undefined // Utiliser l'ID de l'utilisateur connecté s'il existe
    });

    await resource.save();
    res.status(201).json({ message: "Ressource ajoutée avec succès", resource });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la ressource:", error);
    res.status(500).json({ error: error.message || "Erreur lors de l'ajout de la ressource" });
  }
};

// Récupérer toutes les ressources
const getResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    if (!resources || resources.length === 0) {
      return res.json([]);
    }

    const resourcesWithState = resources.map(resource => {
      const resourceObj = resource.toObject();
      return {
        ...resourceObj,
        likesCount: resourceObj.likes.length,
        favoritesCount: resourceObj.favorites.length,
        likes: resourceObj.likes,
        favorites: resourceObj.favorites
      };
    });

    res.json(resourcesWithState);
  } catch (error) {
    console.error('Error getting resources:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Search resources by title
const searchResources = async (req, res) => {
  try {
    const { query } = req.query;
    let searchQuery = {};
    
    if (query) {
      searchQuery = {
        title: { $regex: query, $options: 'i' } // Case-insensitive search
      };
    }

    const resources = await Resource.find(searchQuery)
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({ resources });
  } catch (error) {
    console.error("Error searching resources:", error);
    res.status(500).json({ error: error.message || "Error searching resources" });
  }
};

// Mettre à jour une ressource
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type } = req.body;

    // 1. Vérifier si la ressource existe
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: "Ressource non trouvée" });
    }

    // Validation de la description si elle est fournie
    if (description && (description.length < 50 || description.length > 500)) {
      return res.status(400).json({
        error: `La description doit contenir entre 50 et 500 caractères. Actuel: ${description.length} caractères`
      });
    }

    // 2. Traiter les nouveaux fichiers
    let urifiles = [...(resource.urifiles || [])]; // Garder les fichiers existants avec fallback
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        let uploadPath = '';
        if (file.mimetype.startsWith('image/')) uploadPath = 'images/';
        else if (file.mimetype.startsWith('video/')) uploadPath = 'videos/';
        else if (file.mimetype.startsWith('audio/')) uploadPath = 'audios/';
        else if (file.mimetype === 'application/pdf') uploadPath = 'pdfs/';
        
        urifiles.push(`/uploads/${uploadPath}${file.filename}`);
      });
    }

    // 3. Mise à jour de la ressource
    const updatedResource = await Resource.findByIdAndUpdate(
      id,
      {
        $set: {
          title: title || resource.title,
          description: description || resource.description,
          type: type || resource.type,
          urifiles,
          updatedAt: Date.now()
        }
      },
      { new: true }
    );

    res.json({ message: "Ressource mise à jour avec succès", resource: updatedResource });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la ressource:", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour de la ressource" });
  }
};

// Supprimer une ressource
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: "Ressource non trouvée" });
    }
    res.json({ message: "Ressource supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la ressource:", error);
    res.status(500).json({ error: "Erreur lors de la suppression de la ressource" });
  }
};

// Récupérer une ressource par son ID
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: "Ressource non trouvée" });
    }
    res.json(resource);
  } catch (error) {
    console.error("Erreur lors de la récupération de la ressource:", error);
    res.status(500).json({ error: "Erreur lors de la récupération de la ressource" });
  }
};
// Bloquer ou débloquer une ressource
const toggleBlockResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ error: "Ressource non trouvée" });
    }

    // Toggle du champ isBlocked
    resource.isBlocked = !resource.isBlocked;
    await resource.save();

    res.json({ 
      message: `Ressource ${resource.isBlocked ? 'bloquée' : 'débloquée'} avec succès`, 
      isBlocked: resource.isBlocked 
    });
  } catch (error) {
    console.error("Erreur lors du blocage/déblocage:", error);
    res.status(500).json({ error: "Erreur serveur lors du blocage/déblocage de la ressource" });
  }
};

// Contrôleur pour obtenir les ressources les plus aimées par type
const getMostLikedResourcesByType = async (req, res) => {
  try {
    const stats = await Resource.aggregate([
      // Filtrer les ressources non bloquées
      { $match: { isBlocked: false } },

      // Ajouter un champ likesCount basé sur la taille du tableau likes
      {
        $addFields: {
          likesCount: { $size: "$likes" }
        }
      },

      // Grouper par type et collecter les ressources
      {
        $group: {
          _id: "$type",
          topResources: {
            $push: {
              _id: "$_id",
              title: "$title",
              description: "$description",
              likesCount: "$likesCount",
              createdAt: "$createdAt"
            }
          }
        }
      },

      // Trier les ressources dans chaque type par nombre de likes décroissant
      {
        $project: {
          _id: 1,
          topResources: {
            $slice: [
              {
                $sortArray: {
                  input: "$topResources",
                  sortBy: { likesCount: -1 }
                }
              },
              5 // Top 5 par type, modifie ce chiffre si besoin
            ]
          }
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    console.error("Erreur lors de l'agrégation :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
const getResourceStatsByType = async (req, res) => {
  try {
    const totalCount = await Resource.countDocuments({ isBlocked: false });

    const stats = await Resource.aggregate([
      { $match: { isBlocked: false } },
      {
        $addFields: {
          likesCount: { $size: "$likes" }
        }
      },
      {
        $group: {
          _id: "$type",
          totalResources: { $sum: 1 },
          totalLikes: { $sum: "$likesCount" }
        }
      },
      {
        $project: {
          type: "$_id",
          totalResources: 1,
          totalLikes: 1,
          percentage: {
            $multiply: [
              { $divide: ["$totalResources", totalCount] },
              100
            ]
          }
        }
      },
      { $sort: { totalLikes: -1 } }
    ]);

    // Identifier le type le plus populaire
    const mostPopular = stats.length > 0 ? stats[0].type : null;

    res.status(200).json({
      totalResources: totalCount,
      statsByType: stats,
      mostPopularType: mostPopular
    });

  } catch (error) {
    console.error("Erreur lors de l'obtention des statistiques :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


module.exports = {
  addResource,
  getResources,
  updateResource,
  deleteResource,
  searchResources,
  getResourceById,
  toggleBlockResource,
  getMostLikedResourcesByType ,
  getResourceStatsByType
};
