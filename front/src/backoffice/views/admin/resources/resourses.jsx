import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddResources from './components/AddResourses';
import EditResource from './components/EditResource';
import NotificationCard from '../../../components/card/NotificationCard';
import ResourceService from '../../../../Services/ResourceService';
import { PencilIcon, TrashIcon, InformationCircleIcon } from '@heroicons/react/outline';

const Resources = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('list');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [likes, setLikes] = useState({});

  const ITEMS_PER_PAGE = 4;

  const filteredResources = selectedType
    ? resources.filter(resource => resource.type === selectedType)
    : resources;

  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredResources.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (searchQuery) {
      searchResources();
    } else {
      loadResources();
    }
  }, [searchQuery]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await ResourceService.getResources();
      console.log('API Response:', response);
      const resourcesData = Array.isArray(response) ? response : [];
      
      // Initialiser les états des likes
      const newLikes = {};
      resourcesData.forEach(resource => {
        newLikes[resource._id] = {
          count: resource.likesCount || 0,
          isLiked: resource.isLiked || false
        };
      });
      setLikes(newLikes);
      setResources(resourcesData);
    } catch (error) {
      console.error("Error loading resources", error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const searchResources = async () => {
    try {
      setLoading(true);
      const response = await ResourceService.searchResources(searchQuery);
      setResources(response?.resources || []);
      setCurrentPage(1); // Reset to first page when searching
    } catch (error) {
      console.error("Error searching resources:", error);
      showNotification(
        error.response?.data?.error || "Error searching resources",
        "error"
      );
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = (value) => {
    setSearchQuery(value);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await ResourceService.deleteResource(id);
        showNotification("Ressource supprimée avec succès", "success");
        loadResources();
      } catch (error) {
        showNotification(
          error.response?.data?.error || "Error during deletion",
          "error"
        );
      }
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleCloseNotification = () => {
    setNotification({ show: false, message: "", type: "" });
  };

  const handleAddSuccess = () => {
    setCurrentView('list');
    loadResources();
    showNotification("Resource added successfully");
  };

  const handleEditSuccess = async () => {
    await loadResources();
    setCurrentView('list');
    setSelectedResource(null);
    showNotification("Resource updated successfully");
  };

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setCurrentView('edit');
  };

  const renderPagination = () => {
    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-lg ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-brand-500 text-white hover:bg-brand-600'
          }`}
        >
          Previous
        </button>
        
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-lg ${
            currentPage === totalPages
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-brand-500 text-white hover:bg-brand-600'
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      );
    }

    switch (currentView) {
      case 'add':
        return <AddResources onSuccess={handleAddSuccess} onCancel={() => setCurrentView('list')} />;
      case 'edit':
        return selectedResource ? (
          <EditResource 
            resource={selectedResource}
            onSuccess={handleEditSuccess}
            onCancel={() => {
              setCurrentView('list');
              setSelectedResource(null);
            }}
          />
        ) : null;
      default:
        return (
          <>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
              {currentItems.map((resource) => (
                <div
                  key={resource._id}
                  className="relative flex flex-col break-words rounded-lg border border-gray-200 bg-white shadow-lg transition-all hover:shadow-xl"
                >
                  <div className="p-4">
                    {resource.isBlocked && (
                      <div className="alert alert-danger mb-3" role="alert">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        This resource is blocked by admin
                      </div>
                    )}
                    <div className="mb-3">
                      <h3 className="text-xl font-semibold text-navy-700 line-clamp-2">
                        {resource.title}
                      </h3>
                      {resource.titleTranslation && (
                        <p className="text-sm text-gray-500 mt-1">
                          <i className="fas fa-language me-1"></i>
                          {resource.titleTranslation}
                        </p>
                      )}
                      <div className="mt-1 flex flex-col gap-1">
                        <p className="text-xs text-gray-500">
                          Created by: {resource.createdBy?.username || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created at: {new Date(resource.createdAt).toLocaleDateString('en-EN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          Updated at: {new Date(resource.updatedAt).toLocaleDateString('en-EN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-red-500">
                            <i className="fas fa-heart me-1"></i>
                            {resource.likesCount || 0} likes
                          </span>
                          <span className="text-sm text-warning">
                            <i className="fas fa-star me-1"></i>
                            {resource.favoritesCount || 0} favorites
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-base text-gray-600 line-clamp-3">
                        {resource.description}
                      </p>
                      {resource.descriptionTranslation && (
                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                          <i className="fas fa-language me-1"></i>
                          {resource.descriptionTranslation}
                        </p>
                      )}
                    </div>

                    <div className="mt-2 mb-4">
                      <span className="inline-block px-2 py-1 text-sm font-medium rounded-full capitalize" 
                        style={{
                          backgroundColor: 
                            resource.type === 'meditation' ? '#E8F5E9' :
                            resource.type === 'therapy' ? '#E3F2FD' :
                            '#FFF3E0',
                          color:
                            resource.type === 'meditation' ? '#2E7D32' :
                            resource.type === 'therapy' ? '#1565C0' :
                            '#EF6C00'
                        }}>
                        {resource.type}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-3 justify-center items-center">
                      <button
                        onClick={() => navigate(`/admin/resources/details/${resource._id}`)}
                        className="flex items-center justify-center gap-2 p-2 text-teal-500 hover:text-teal-600"
                      >
                        <InformationCircleIcon className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => handleEdit(resource)}
                        className="flex items-center justify-center gap-2 p-2 text-yellow-500 hover:text-yellow-600"
                      >
                        <PencilIcon className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => handleDelete(resource._id)}
                        className="flex items-center justify-center gap-2 p-2 text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {!loading && (!Array.isArray(filteredResources) || filteredResources.length === 0) && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  No resources found
                </div>
              )}
            </div>
            {filteredResources.length > ITEMS_PER_PAGE && renderPagination()}
          </>
        );
    }
  };

  return (
    <div className="mt-3 p-4">
      <div className="mb-6">
       
        {currentView === 'list' && (
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="w-64 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>

              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1); // reset page when filter changes
                }}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                <option value="">All Types</option>
                <option value="meditation">Meditation</option>
                <option value="therapy">Therapy</option>
                <option value="well-being">Well-being</option>
              </select>
            </div>

            <button
              onClick={() => setCurrentView('add')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Add Resource</span>
            </button>
          </div>
        )}
        {(currentView === 'add' || currentView === 'edit') && (
          <button
            onClick={() => {
              setCurrentView('list');
              setSelectedResource(null);
            }}
            className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 transition-colors mt-4"
          >
            Back to list
          </button>
        )}
      </div>

      {renderContent()}

      {notification.show && (
        <NotificationCard
          message={notification.message}
          type={notification.type}
          show={notification.show}
          onClose={handleCloseNotification}
        />
      )}
    </div>
  );
};

export default Resources;
