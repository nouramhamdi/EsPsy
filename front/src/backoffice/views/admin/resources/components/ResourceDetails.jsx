import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ResourceService from "../../../../../Services/ResourceService";
import NotificationCard from "../../../../components/card/NotificationCard";

export default function ResourceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    loadResource();
  }, [id]);

  const loadResource = async () => {
    try {
      setLoading(true);
      const response = await ResourceService.getResourceById(id);
      if (response) {
        setResource(response);
      } else {
        showNotification("Ressource non trouvée", "error");
      }
    } catch (error) {
      showNotification(
        error.response?.data?.error || "Erreur lors du chargement de la ressource",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600">loading...</div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-500">Resource not found</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        {/* <button
          onClick={() => navigate('/admin/RessourcesManagement')}
          className="mb-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          Retour
        </button> */}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-navy-700">
            {resource.title}
          </h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-700">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">
              {resource.description}
            </p>
            {resource.descriptionTranslation && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  <i className="fas fa-language me-2"></i>
                  Traduction
                </h4>
                <p className="text-gray-600">{resource.descriptionTranslation}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-700">Type</h3>
            <p className="text-gray-600 capitalize">{resource.type}</p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Files</h3>
            {resource.urifiles && resource.urifiles.length > 0 ? (
              <div className="mt-2 space-y-6">
                {resource.urifiles.map((uri, index) => {
                  const fileName = uri.split('/').pop();
                  const fileType = fileName.split('.').pop().toLowerCase();
                  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileType);
                  const isPDF = fileType === 'pdf';
                  const isVideo = ['mp4', 'mpeg'].includes(fileType);
                  const isAudio = ['mp3', 'wav'].includes(fileType);
                  
                  // Construire l'URL complète
                  const fullUrl = uri.startsWith('http') ? uri : `https://espsy.onrender.com${uri}`;

                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex flex-col space-y-4">
                        <div className="text-sm font-medium text-gray-700">
                          {fileName}
                        </div>

                        <div className="w-full">
                          {isImage && (
                            <div className="relative">
                              <img 
                                src={fullUrl}
                                alt={fileName}
                                className="w-full h-auto rounded-lg shadow-md"
                              />
                            </div>
                          )}

                          {isPDF && (
                            <div className="flex items-center space-x-2 text-gray-700">
                              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                              </svg>
                              <a 
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                View PDF
                              </a>
                            </div>
                          )}

                          {isVideo && (
                            <div className="w-full">
                              <video controls className="w-full rounded-lg shadow-md">
                                <source src={fullUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          )}

                          {isAudio && (
                            <div className="w-full">
                              <audio controls className="w-full">
                                <source src={fullUrl} type={`audio/${fileType}`} />
                                Your browser does not support the audio tag.
                              </audio>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end space-x-3">
                          <a
                            href={fullUrl}
                            download={fileName}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Download
                          </a>
                          {(isImage || isPDF) && (
                            <a
                              href={fullUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                              Open
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No files available</p>
            )}
          </div>

          {/* <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-700">Date de création</h3>
            <p className="text-gray-600">
              {new Date(resource.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div> */}

          {resource.createdBy && (
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-700">Créé par</h3>
              <p className="text-gray-600">
                {resource.createdBy.username}
                {resource.createdBy.email && ` (${resource.createdBy.email})`}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          {resource.isBlocked && (
            <div className="alert alert-danger mb-4" role="alert">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-xl me-3"></i>
                <div>
                  <h4 className="font-bold mb-1">This resource is blocked</h4>
                  <p className="mb-0">
                    Please contact the admin at{' '}
                    <a href={`mailto:espsytunisia@gmail.com`} className="text-danger underline">
                    espsytunisia@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-navy-700">{resource.title}</h2>
              {resource.titleTranslation && (
                <p className="text-lg text-gray-600 mt-2">
                  <i className="fas fa-language me-2"></i>
                  {resource.titleTranslation}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {/* <button
                onClick={() => navigate(`/admin/resources/edit/${resource._id}`)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </button> */}
              <button
                onClick={() => navigate('/admin/RessourcesManagement')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>
          </div>

          

          {/* Informations de création et modification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <span className="font-medium">Created at:</span>
                <span className="ml-1">
                  {new Date(resource.createdAt).toLocaleDateString('en-EN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="font-medium">Last modified:</span>
                <span className="ml-1">
                  {new Date(resource.updatedAt).toLocaleDateString('en-EN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Le reste du contenu */}
        </div>
      </div>

      {notification.show && (
        <NotificationCard
          message={notification.message}
          type={notification.type}
          show={notification.show}
          onClose={() => setNotification({ show: false, message: "", type: "" })}
        />
      )}
    </div>
  );
}
