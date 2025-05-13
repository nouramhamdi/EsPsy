import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EventServices from "../../../../Services/EventService";
import { generateImageFromTitle } from "../../../../Services/AIImageService";
import axios from "axios";

const UpdateEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    eventType: "",
    date: "",
    location: "",
    maxParticipants: "",
    targetAudience: "",
    status: "",
    eventPicture: "",
  });


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await EventServices.getEventById(id);
        const formattedDate = new Date(response.date).toISOString().split('T')[0];
        setEventData({
          ...response,
          date: formattedDate
        });
        setLoading(false);
      } catch (err) {
        setError("Unable to load event data.");
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = ['image/jpeg', 'image/png'];
      if (!validImageTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          image: "Image format must be JPG or PNG"
        }));
        e.target.value = '';
        return;
      }
      setImage(file);
      setErrors(prev => ({
        ...prev,
        image: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = {};
    if (!eventData.title || eventData.title.length < 6 || eventData.title.length > 255) {
      formErrors.title = "Title must be between 6 and 255 characters";
    }
    if (!eventData.description || eventData.description.length < 6 || eventData.description.length > 255) {
      formErrors.description = "Description must be between 6 and 255 characters";
    }
    if (!eventData.eventType) {
      formErrors.eventType = "Event type is required";
    }
    if (!eventData.date) {
      formErrors.date = "Date is required";
    }
    if (!eventData.location || eventData.location.length < 6 || eventData.location.length > 255) {
      formErrors.location = "Location must be between 6 and 255 characters";
    }
    const maxP = parseInt(eventData.maxParticipants, 10);
    if (!eventData.maxParticipants || isNaN(maxP) || maxP < 1 || maxP > 20) {
      formErrors.maxParticipants = "Number of participants must be between 1 and 20";
    }
    if (!eventData.targetAudience) {
      formErrors.targetAudience = "Target audience is required";
    }
    // L'image n'est plus obligatoire car elle peut être générée par l'IA
    // if (!image && !eventData.eventPicture) {
    //   formErrors.eventPicture = "Event image is required";
    // }
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    try {
      const formData = new FormData();
      Object.keys(eventData).forEach(key => {
        if (!['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) {
          if (key === 'eventPicture') {
            if (image) {
              formData.append('eventPicture', image);
            } else if (eventData.eventPicture) {
              // Si c'est juste le nom de l'image, NE PAS l'envoyer comme fichier
              // formData.append('eventPicture', eventData.eventPicture);
            }
          } else {
            formData.append(key, eventData[key]);
          }
        }
      });

      // DEBUG : Affiche le contenu du formData envoyé
      for (let pair of formData.entries()) {
        console.log(pair[0]+ ':', pair[1]);
      }

      const response = await EventServices.updateEvent(id, formData);
      console.log("Update response:", response);

      // Vérifier si une image a été générée par l'IA
      const isAIGenerated = image && image.name && image.name.startsWith('ai-generated-');

      if (isAIGenerated) {
        setMessage({
          text: "Event updated successfully with AI-generated image.",
          type: "success"
        });
      } else if (image) {
        setMessage({
          text: "Event updated successfully with new image.",
          type: "success"
        });
      } else {
        setMessage({
          text: "Event updated successfully.",
          type: "success"
        });
      }

      setTimeout(() => {
        navigate("/admin/EventsManagement", { replace: true });
      }, 2000);
    } catch (err) {
      setMessage({ text: "Error while updating the event. Please try again.", type: "error" });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow-lg rounded-md">
      <h2 className="text-2xl font-bold mb-4">Update Event</h2>
      {message.text && (
        <div className={`p-4 mb-4 rounded text-center ${
          message.type === "success" ? "bg-green-100 text-green-700 border border-green-400" :
          "bg-red-100 text-red-700 border border-red-400"
        }`}>
          {message.text}
        </div>
      )}
      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Title:</label>
        <input
          type="text"
          name="title"
          value={eventData.title}
          onChange={handleChange}
          className="w-full p-2 border mb-3"
        />
        {errors.title && <p className="text-red-500">{errors.title}</p>}

        <label className="block mb-2">Description:</label>
        <textarea
          name="description"
          value={eventData.description}
          onChange={handleChange}
          className="w-full p-2 border mb-3"
        />
        {errors.description && <p className="text-red-500">{errors.description}</p>}

        <label className="block mb-2">Type:</label>
        <select
          name="eventType"
          value={eventData.eventType}
          onChange={handleChange}
          className="w-full p-2 border mb-3"
        >
          <option value="">Select Event Type</option>
          <option value="Workshop">Workshop</option>
          <option value="Therapy Session">Therapy Session</option>
          <option value="Seminar">Seminar</option>
          <option value="Social Event">Social Event</option>
          <option value="Support Group">Support Group</option>
        </select>
        {errors.eventType && <p className="text-red-500">{errors.eventType}</p>}

        <label className="block mb-2">Date:</label>
        <input
          type="date"
          name="date"
          value={eventData.date}
          onChange={handleChange}
          className="w-full p-2 border mb-3"
        />
        {errors.date && <p className="text-red-500">{errors.date}</p>}

        <label className="block mb-2">Location:</label>
        <input
          type="text"
          name="location"
          value={eventData.location}
          onChange={handleChange}
          className="w-full p-2 border mb-3"
        />
        {errors.location && <p className="text-red-500">{errors.location}</p>}

        <label className="block mb-2">Maximum Participants:</label>
        <input
          type="number"
          name="maxParticipants"
          value={eventData.maxParticipants}
          onChange={handleChange}
          min="1"
          max="20"
          className="w-full p-2 border mb-3"
        />
        {errors.maxParticipants && <p className="text-red-500">{errors.maxParticipants}</p>}

        <label className="block mb-2">Target Audience:</label>
        <select
          name="targetAudience"
          value={eventData.targetAudience}
          onChange={handleChange}
          className="w-full p-2 border mb-3"
        >
          <option value="">Select Target Audience</option>
          <option value="Student">Student</option>
          <option value="Psychologist">Psychologist</option>
          <option value="Teacher">Teacher</option>
          <option value="Students, Teachers and Psychologists">Students, Teachers and Psychologists</option>
        </select>
        {errors.targetAudience && <p className="text-red-500">{errors.targetAudience}</p>}

        <label className="block mb-2">Image:</label>
        <div className="flex flex-col space-y-2">
          <input
            type="file"
            name="eventPicture"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full p-2 border mb-1"
          />
          <div className="flex items-center">
            <span className="mr-2">or</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  setMessage({ text: "Generating image...", type: "info" });

                  // Use title, event type and description for better image generation
                  const generatedImage = await generateImageFromTitle(eventData.title, eventData.eventType, eventData.description);

                  if (generatedImage && generatedImage.length > 0 && generatedImage[0].url) {
                    const imageUrl = generatedImage[0].url;

                    // Add cache-busting parameter to avoid browser caching
                    const uniqueImageUrl = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}cache=${Date.now()}`;

                    // Verify that the URL is valid
                    const img = new Image();
                    img.onload = async () => {
                      console.log("Image loaded successfully:", uniqueImageUrl);

                      try {
                        const response = await fetch(uniqueImageUrl);
                        const blob = await response.blob();
                        const file = new File([blob], `ai-generated-${Date.now()}.png`, { type: 'image/png' });

                        setImage(file);
                        setImagePreviewUrl(uniqueImageUrl);
                        setErrors(prev => ({ ...prev, image: null, eventPicture: null }));

                        setMessage({
                          text: `Image generated successfully for "${eventData.title}"!`,
                          type: "success"
                        });
                        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
                      } catch (fetchError) {
                        console.error("Error fetching image:", fetchError);
                        handleFallbackImage();
                      }
                    };

                    img.onerror = () => {
                      console.error("Error loading image:", imageUrl);
                      handleFallbackImage();
                    };

                    // Trigger image loading
                    img.src = imageUrl;
                  } else {
                    console.error('Unexpected API response format:', generatedImage);
                    handleFallbackImage();
                  }

                  // Function to use a fallback image
                  function handleFallbackImage() {
                    const fallbackUrl = 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg';

                    // Create a File object from the fallback URL
                    fetch(fallbackUrl)
                      .then(response => response.blob())
                      .then(blob => {
                        const file = new File([blob], `ai-generated-fallback-${Date.now()}.png`, { type: 'image/png' });

                        setImage(file);
                        setImagePreviewUrl(fallbackUrl);
                        setErrors(prev => ({ ...prev, image: null, eventPicture: null }));

                        setMessage({
                          text: "Image generated successfully (fallback image used)!",
                          type: "success"
                        });
                        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
                      })
                      .catch(error => {
                        console.error("Error fetching fallback image:", error);
                        setMessage({
                          text: "Error generating image.",
                          type: "error"
                        });
                      });
                  }
                } catch (error) {
                  console.error('Error generating AI image:', error);
                  setMessage({
                    text: "Error generating image.",
                    type: "error"
                  });
                }
              }}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Generate image with AI
            </button>
          </div>
        </div>
        {errors.eventPicture && (
          <p className="text-red-500">{errors.eventPicture}</p>
        )}
        {(image || imagePreviewUrl) && (
          <div className="mt-2">
            <p className="text-green-600 mb-2">
              {imagePreviewUrl ? "AI-generated image" : "New image selected"}
            </p>
            <img
              src={imagePreviewUrl || (image ? URL.createObjectURL(image) : '')}
              alt="Preview"
              className="w-32 h-32 object-cover rounded"
              onError={(e) => {
                console.error("Error loading image:", e);
                e.target.onerror = null;
                e.target.src = 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg';
              }}
            />
          </div>
        )}
        {eventData.eventPicture && !image && !imagePreviewUrl && (
          <div className="mt-2">
            <p className="text-green-600 mb-2">Current image preserved</p>
            {typeof eventData.eventPicture === 'string' && (
              <img
                src={eventData.eventPictureIsUrl
                  ? eventData.eventPicture
                  : `data:image/jpeg;base64,${eventData.eventPicture}`}
                alt="Current"
                className="w-32 h-32 object-cover rounded"
                onError={(e) => {
                  console.error("Error loading current image:", e);
                  e.target.onerror = null;
                  e.target.src = 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg';
                }}
              />
            )}
          </div>
        )}

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Update Event
        </button>
      </form>
    </div>
  );
};

export default UpdateEvent;