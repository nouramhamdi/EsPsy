import React, { useState, useEffect } from 'react';
import resourceServices from '../../Services/ResourceService';

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likes, setLikes] = useState({});
  const [favorites, setFavorites] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResources, setFilteredResources] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const ITEMS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"))

  const fetchResources = async () => {
    try {
      console.log("Fetching resources...");
      const response = await resourceServices.getResources();
      console.log("Full API Response:", response);
      
      // Initialiser les états des likes et favoris
      const newLikes = {};
      const newFavorites = {};
      
      response.forEach(resource => {
        newLikes[resource._id] = {
          count: resource.likesCount || 0,
          isLiked: resource.isLiked || false
        };
        newFavorites[resource._id] = {
          count: resource.favoritesCount || 0,
          isFavorited: resource.isFavorited || false
        };
      });

      setLikes(newLikes);
      setFavorites(newFavorites);
      setResources(response);
      setHasMore(false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching resources:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      setResources([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Resources component mounted");
    fetchResources();
  }, [page]);

  useEffect(() => {
    let filtered = [...resources];
    
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

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    setHasMore(currentPage < totalPages);
    
    // Appliquer la pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    filtered = filtered.slice(startIndex, endIndex);
    
    setFilteredResources(filtered);
  }, [searchTerm, resources, selectedType, currentPage]);

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'meditation':
        return 'bg-info';
      case 'therapy':
        return 'bg-success';
      case 'well-being':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleOpen = (resource) => {
    setSelectedResource(resource);
  };

  const handleClose = () => {
    setSelectedResource(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderFilePreview = (file) => {
    const fileType = file.mimetype || file.type;
    let fileUrl;
    
    // Déterminer le sous-dossier en fonction du type de fichier
    if (fileType.startsWith('image/')) {
      fileUrl = `'http://localhost:5000'}/uploads/images/${file.filename}`;
      console.log('====================================');
      console.log('Image file URL:', fileUrl);
      console.log('====================================');
    } else if (fileType.startsWith('video/')) {
      fileUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/videos/${file.filename}`;
    } else if (fileType.startsWith('audio/')) {
      fileUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/audios/${file.filename}`;
    } else if (fileType === 'application/pdf') {
      fileUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/pdfs/${file.filename}`;
    } else {
      fileUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/${file.filename}`;
    }
    
    console.log('File info:', {
      file,
      fileType,
      fileUrl,
      filename: file.filename
    });

    if (fileType.startsWith('image/')) {
      return (
        <div className="mb-3">
          <img 
            src={fileUrl} 
            alt={file.originalname || "Image"} 
            className="img-fluid rounded"
            style={{ maxHeight: '300px', objectFit: 'contain' }}
          />
          <div className="mt-2">
            <a href={fileUrl} download className="btn btn-sm btn-outline-primary">
              <i className="fas fa-download me-2"></i>
              Download Image
            </a>
          </div>
        </div>
      );
    } else if (fileType.startsWith('video/')) {
      return (
        <div className="mb-3">
          <video controls className="w-100 rounded" style={{ maxHeight: '300px' }}>
            <source src={fileUrl} type={fileType} />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
          <div className="mt-2">
            <a href={fileUrl} download className="btn btn-sm btn-outline-primary">
              <i className="fas fa-download me-2"></i>
              Download Video
            </a>
          </div>
        </div>
      );
    } else if (fileType.startsWith('audio/')) {
      return (
        <div className="mb-3">
          <audio controls className="w-100">
            <source src={fileUrl} type={fileType} />
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
          <div className="mt-2">
            <a href={fileUrl} download className="btn btn-sm btn-outline-primary">
              <i className="fas fa-download me-2"></i>
              Download Audio
            </a>
          </div>
        </div>
      );
    } else if (fileType === 'application/pdf') {
      return (
        <div className="mb-3">
          <div className="d-flex gap-2">
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <i className="fas fa-file-pdf me-2"></i>
              Voir le PDF
            </a>
            <a href={fileUrl} download className="btn btn-outline-primary">
              <i className="fas fa-download me-2"></i>
              Download PDF
            </a>
          </div>
        </div>
      );
    } else {
      // Pour tous les autres types de fichiers
      return (
        <div className="mb-3">
          <div className="d-flex align-items-center gap-3">
            <i className="fas fa-file fa-2x text-primary"></i>
            <div>
              <p className="mb-1">{file.originalname || "Fichier"}</p>
              <a href={fileUrl} download className="btn btn-sm btn-primary">
                <i className="fas fa-download me-2"></i>
                Download
              </a>
            </div>
          </div>
        </div>
      );
    }
  };

  const handleLike = async (resourceId) => {
    try {
      console.log('Attempting to like resource:', resourceId);
      const data = await resourceServices.likeResource(resourceId,loggedUser._id);
      console.log('Like response data:', data);
      
      // Mettre à jour l'état local des likes
      setLikes(prev => {
        console.log('Previous likes state:', prev);
        const newState = {
          ...prev,
          [resourceId]: {
            count: data.likes,
            isLiked: data.isLiked
          }
        };
        console.log('New likes state:', newState);
        return newState;
      });

      // Mettre à jour la ressource dans la liste
      setResources(prev => {
        console.log('Previous resources:', prev);
        const updated = prev.map(resource => {
          if (resource._id === resourceId) {
            return {
              ...resource,
              likesCount: data.likes,
              isLiked: data.isLiked
            };
          }
          return resource;
        });
        console.log('Updated resources:', updated);
        return updated;
      });
    } catch (error) {
      console.error('Error liking resource:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  const handleFavorite = async (resourceId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/resources/${resourceId}/favorite`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to favorite resource');
      }

      const data = await response.json();
      
      // Mettre à jour l'état local
      setFavorites(prev => ({
        ...prev,
        [resourceId]: {
          count: data.favorites,
          isFavorited: data.isFavorited
        }
      }));

      // Mettre à jour la ressource dans la liste
      setResources(prev => prev.map(resource => {
        if (resource._id === resourceId) {
          return {
            ...resource,
            favoritesCount: data.favorites,
            isFavorited: data.isFavorited
          };
        }
        return resource;
      }));
    } catch (error) {
      console.error('Error favoriting resource:', error);
      alert('You must be logged in to favorite resources');
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
    const totalPages = Math.ceil(resources.length / ITEMS_PER_PAGE);
    const pages = [];
    
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Resources</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setSearchTerm('')}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
        
        <div className="col-md-6">
          <select
            className="form-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="meditation">Meditation</option>
            <option value="therapy">Therapy</option>
            <option value="well-being">Well-being</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {filteredResources.map((resource) => (
              <div key={resource._id} className="col">
                <div className="card h-100 shadow-sm hover-card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className={`badge ${getTypeBadgeColor(resource.type)}`}>
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </span>
                      <div className="d-flex gap-2">
                        <span className="badge bg-light text-danger">
                          <i className="fas fa-heart me-1"></i>
                          {likes[resource._id]?.count || 0}
                        </span>
                        <span className="badge bg-light text-warning">
                          <i className="fas fa-star me-1"></i>
                          {favorites[resource._id]?.count || 0}
                        </span>
                      </div>
                    </div>
                    <h5 className="card-title mb-3">{resource.title}</h5>
                    <p className="card-text text-muted mb-4" style={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: '3',
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {resource.description}
                    </p>
                    <div className="mt-auto">
                      <small className="text-muted d-block mb-3">
                        Published on {formatDate(resource.createdAt)}
                      </small>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleOpen(resource)}
                        data-bs-toggle="modal"
                        data-bs-target="#resourceModal"
                      >
                        View More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-4">
            <nav aria-label="Resource pagination">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {getPaginationNumbers().map(number => (
                  <li 
                    key={number}
                    className={`page-item ${currentPage === number ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(number)}
                    >
                      {number}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${!hasMore ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasMore}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
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
          <div className="modal-content">
            {selectedResource && (
              <>
                <div className="modal-header">
                  <h5 className="modal-title" id="resourceModalLabel">
                    {selectedResource.title}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={handleClose}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-4">
                    <h6 className="text-muted mb-2">Description :</h6>
                    <p>{selectedResource.description}</p>
                  </div>
                  
                  {selectedResource.urifiles && selectedResource.urifiles.length > 0 && (
                    <div className="mb-4">
                      <h6 className="text-muted mb-3">Attached Files :</h6>
                      <div className="row">
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

                          const fileUrl = `http://localhost:5000${file}`;
                          
                          switch (fileType) {
                            case 'image':
                              return (
                                <div key={index} className="col-12 mb-3">
                                  <img 
                                    src={fileUrl} 
                                    alt="Image" 
                                    className="img-fluid rounded"
                                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                                  />
                                </div>
                              );
                            case 'video':
                              return (
                                <div key={index} className="col-12 mb-3">
                                  <video controls className="w-100 rounded" style={{ maxHeight: '300px' }}>
                                    <source src={fileUrl} type="video/mp4" />
                                    Your browser does not support video playback.
                                  </video>
                                </div>
                              );
                            case 'audio':
                              return (
                                <div key={index} className="col-12 mb-3">
                                  <audio controls className="w-100">
                                    <source src={fileUrl} type="audio/mpeg" />
                                    Your browser does not support audio playback.
                                  </audio>
                                </div>
                              );
                            case 'pdf':
                              return (
                                <div key={index} className="col-12 mb-3">
                                  <div className="d-flex gap-2">
                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                      <i className="fas fa-file-pdf me-2"></i>
                                      View PDF
                                    </a>
                                  </div>
                                </div>
                              );
                            default:
                              return (
                                <div key={index} className="col-12 mb-3">
                                  <div className="d-flex align-items-center gap-3">
                                    <i className="fas fa-file fa-2x text-primary"></i>
                                    <div>
                                      <p className="mb-1">Attached File</p>

                                    </div>
                                  </div>
                                </div>
                              );
                          }
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <small className="text-muted">
                      Published on {formatDate(selectedResource.createdAt)}
                    </small>
                  </div>
                </div>
                <div className="modal-footer d-flex justify-content-between align-items-center">
                  <div>
                    <button
                      className={`btn ${likes[selectedResource._id]?.isLiked ? 'btn-danger' : 'btn-outline-danger'} me-2`}
                      onClick={() => handleLike(selectedResource._id)}
                    >
                      <i className="fas fa-heart me-2"></i>
                      Like
                      <span className="ms-2 badge bg-light text-danger">
                        {likes[selectedResource._id]?.count || 0}
                      </span>
                    </button>
                    <button
                      className={`btn ${favorites[selectedResource._id]?.isFavorited ? 'btn-warning' : 'btn-outline-warning'} me-2`}
                      onClick={() => handleFavorite(selectedResource._id)}
                    >
                      <i className="fas fa-star me-2"></i>
                      Favorite
                      <span className="ms-2 badge bg-light text-warning">
                        {favorites[selectedResource._id]?.count || 0}
                      </span>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Resources;
