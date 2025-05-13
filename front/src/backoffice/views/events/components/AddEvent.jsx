import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EventServices from "../../../../Services/EventService";
import axios from "axios";
import { generateImageFromTitle } from "../../../../Services/AIImageService";

const AddEvent = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    id_organizer: "", // Add the organizer's ID here if necessary
    title: "",
    description: "",
    eventType: "",
    date: "",
    location: "",
    maxParticipants: "",
    targetAudience: "",
    status: "active",
    eventPicture: null,
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);

  // Pour empêcher la sélection d'une date passée
  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });

    // Vérification automatique pour maxParticipants
    if (name === 'maxParticipants') {
      const maxP = parseInt(value, 10);
      if (!isNaN(maxP) && maxP > 20) {
        setMessage({
          text: "You cannot add more than 20 participants",
          type: "error"
        });
      } else {
        setMessage({ text: "", type: "" });
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check the image format
      const validImageTypes = ['image/jpeg', 'image/png'];
      if (!validImageTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          image: "The image format must be JPG or PNG"
        }));
        e.target.value = ''; // Reset the input
        return;
      }

      // If the format is valid, update the image
      setEventData(prev => ({
        ...prev,
        eventPicture: file
      }));
      setErrors(prev => ({
        ...prev,
        image: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

    // Vérifier si les champs obligatoires sont remplis
    const requiredFields = ['title', 'description', 'eventType', 'date', 'location', 'maxParticipants', 'targetAudience'];
    const newErrors = {};

    requiredFields.forEach(field => {
      if (!eventData[field]) {
        newErrors[field] = `The ${field} field is required`;
      }
    });

    // Validation spécifique pour maxParticipants
    const maxP = parseInt(eventData.maxParticipants, 10);
    if (isNaN(maxP) || maxP < 1 || maxP > 20) {
      newErrors.maxParticipants = "Number of participants must be between 1 and 20";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage({
        text: "Please fill in all required fields",
        type: "error"
      });
      return;
    }

    // Préparer les données du formulaire
    const formData = new FormData();
    formData.append('title', eventData.title);
    formData.append('description', eventData.description);
    formData.append('eventType', eventData.eventType);
    formData.append('date', eventData.date);
    formData.append('location', eventData.location);
    formData.append('maxParticipants', eventData.maxParticipants);
    formData.append('targetAudience', eventData.targetAudience);
    formData.append('status', eventData.status);
    formData.append('psychologistId', loggedUser._id);

    // Ajouter l'image si elle existe
    if (eventData.eventPicture) {
        if (eventData.eventPicture.type === 'ai-generated-image' || eventData.eventPicture.type === 'ai-generated-url') {
            // C'est une image générée par IA
            formData.append('eventPictureUrl', eventData.eventPicture.url);
            formData.append('eventPictureSource', 'ai');
            formData.append('eventPictureName', eventData.eventPicture.name);

            // Indiquer si c'est une image base64 ou une URL
            if (eventData.eventPicture.isBase64) {
                formData.append('eventPictureIsBase64', 'true');
            }

            console.log("Sending AI generated image:", {
                type: eventData.eventPicture.type,
                isBase64: eventData.eventPicture.isBase64,
                name: eventData.eventPicture.name
            });
        } else {
            // C'est un fichier téléchargé
            formData.append('eventPicture', eventData.eventPicture);
            console.log("Sending uploaded image");
        }
    }

    try {
        console.log("Sending data to server:", {
            title: eventData.title,
            description: eventData.description,
            eventType: eventData.eventType,
            hasImage: !!eventData.eventPicture,
            imageType: eventData.eventPicture && eventData.eventPicture.type === 'ai-generated-url' ? 'ai-url' : 'file'
        });

        const response = await axios.post('http://localhost:5000/events/add', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // Message de succès différent selon si une image a été ajoutée
        const isAIGenerated = eventData.eventPicture && eventData.eventPicture.name && eventData.eventPicture.name.startsWith('ai-generated-');

        if (isAIGenerated) {
            setMessage({
                text: "Event added successfully with AI-generated image.",
                type: "success"
            });
        } else if (eventData.eventPicture) {
            setMessage({
                text: "Event added successfully with uploaded image.",
                type: "success"
            });
        } else {
            setMessage({
                text: "Event added successfully without image.",
                type: "success"
            });
        }

        setTimeout(() => {
            navigate("/admin/EventsManagement");
        }, 2000);
    } catch (error) {
        console.error("Error adding event:", error);
        setMessage({
            text: "Error adding event: " + (error.response?.data?.message || error.message),
            type: "error"
        });
    }
};

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Add Event</h2>
      {message.text && (
        <div className={`p-4 mb-4 rounded text-center ${
          message.type === "error" ? "bg-red-100 text-red-700 border border-red-400" :
          message.type === "success" ? "bg-green-100 text-green-700 border border-green-400" :
          "bg-blue-100 text-blue-700 border border-blue-400"
        }`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={eventData.title}
          onChange={handleChange}
          minLength={6}
          maxLength={255}
          className="w-full p-2 border rounded"
        />
        {errors.title && <p className="text-red-500">{errors.title}</p>}
        <textarea
          name="description"
          placeholder="Description"
          value={eventData.description}
          onChange={handleChange}
          minLength={6}
          maxLength={255}
          className="w-full p-2 border rounded"
        />
        {errors.description && <p className="text-red-500">{errors.description}</p>}
        <select
          name="eventType"
          value={eventData.eventType}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Event Type</option>
          <option value="Workshop">Workshop</option>
          <option value="Therapy Session">Therapy Session</option>
          <option value="Seminar">Seminar</option>
          <option value="Social Event">Social Event</option>
          <option value="Support Group">Support Group</option>
        </select>
        {errors.eventType && <p className="text-red-500">{errors.eventType}</p>}
        <input
          type="date"
          name="date"
          value={eventData.date}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          min={today}
        />
        {errors.date && <p className="text-red-500">{errors.date}</p>}
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={eventData.location}
          onChange={handleChange}
          minLength={6}
          maxLength={255}
          className="w-full p-2 border rounded"
        />
        {errors.location && <p className="text-red-500">{errors.location}</p>}
        <input
          type="number"
          name="maxParticipants"
          placeholder="Maximum number of participants"
          value={eventData.maxParticipants}
          onChange={handleChange}
          min={1}
          max={20}
          className="w-full p-2 border rounded"
        />
        {errors.maxParticipants && <p className="text-red-500 font-bold">{errors.maxParticipants}</p>}
        <select
          name="targetAudience"
          value={eventData.targetAudience}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Target Audience</option>
          <option value="Student">Student</option>
          <option value="Psychologist">Psychologist</option>
          <option value="Teacher">Teacher</option>
          <option value="Students, Teachers and Psychologists">Students, Teachers and Psychologists</option>
        </select>
        {errors.targetAudience && <p className="text-red-500">{errors.targetAudience}</p>}
        <div className="mb-4">
          <label className="block mb-2">Image of the event:</label>
          <div className="flex flex-col space-y-2">
            <input
              type="file"
              name="eventPicture"
              onChange={handleImageChange}
              accept="image/*"
              className="w-full p-2 border rounded mb-1"
            />
            <div className="flex items-center">
              <span className="mr-2">or</span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setMessage({ text: "Generating image...", type: "info" });

                    // Utiliser le titre, le type d'événement et la description pour une meilleure génération d'image
                    const generatedImage = await generateImageFromTitle(eventData.title, eventData.eventType, eventData.description);

                    if (generatedImage && generatedImage.length > 0 && generatedImage[0].url) {
                      // Stocker l'URL de l'image directement
                      const imageUrl = generatedImage[0].url;

                      // Pour les images data:image, pas besoin de cache-busting
                      const imageUrlToUse = imageUrl;
                      const imageSource = generatedImage[0].source || 'IA';
                      const imageSearchQuery = generatedImage[0].searchQuery || eventData.title;

                      // Afficher des informations détaillées sur l'image générée
                      console.log("=== DÉTAILS DE L'IMAGE GÉNÉRÉE ===");
                      console.log(`URL de l'image: ${imageUrlToUse}`);
                      console.log(`Requête utilisée: "${imageSearchQuery}"`);
                      console.log(`Source de l'image: ${imageSource}`);
                      console.log(`Titre de l'événement: "${eventData.title}"`);
                      console.log(`Description de l'événement: "${eventData.description}"`);

                      // Vérifier que l'URL est valide
                      const img = new Image();

                      // Ajouter des attributs CORS pour éviter les problèmes de chargement
                      img.crossOrigin = "anonymous";

                      // Gérer les erreurs de chargement d'image
                      img.onerror = () => {
                        console.error("Erreur lors du chargement de l'image:", imageUrlToUse);

                        // Utiliser une image de secours fiable
                        const fallbackUrl = 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg';
                        console.log("Utilisation d'une image de secours:", fallbackUrl);

                        const imageData = {
                          type: 'ai-generated-image',
                          url: fallbackUrl,
                          name: `ai-generated-fallback-${Date.now()}.jpg`,
                          isBase64: false,
                          searchQuery: imageSearchQuery,
                          source: 'Pexels (image de secours)'
                        };

                        setEventData(prev => ({
                          ...prev,
                          eventPicture: imageData
                        }));

                        // Afficher un aperçu de l'image
                        setPreviewUrl(fallbackUrl);

                        setMessage({
                          text: `Image générée (image de secours utilisée)`,
                          type: "warning"
                        });
                        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
                      };

                      img.onload = () => {
                        console.log("Image chargée avec succès");
                        console.log(`Dimensions de l'image: ${img.width}x${img.height}`);

                        // Créer un objet spécial pour indiquer que c'est une image générée par IA
                        const imageData = {
                          type: 'ai-generated-image',
                          url: imageUrlToUse,
                          name: `ai-generated-${Date.now()}.jpg`,
                          isBase64: imageUrlToUse.startsWith('data:'),
                          searchQuery: imageSearchQuery,
                          source: imageSource
                        };

                        console.log("Données de l'image générée:", imageData);

                        setEventData(prev => ({
                          ...prev,
                          eventPicture: imageData
                        }));

                        // Afficher un aperçu de l'image
                        setPreviewUrl(imageUrlToUse);

                        setMessage({
                          text: `Image générée avec succès pour "${eventData.title}" (source: ${imageSource})`,
                          type: "success"
                        });
                        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
                      };

                      img.onerror = () => {
                        console.error("Erreur lors du chargement de l'image:", imageUrlToUse);
                        // Utiliser une image de secours
                        const fallbackUrl = 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg';

                        setEventData(prev => ({
                          ...prev,
                          eventPicture: {
                            type: 'ai-generated-url',
                            url: fallbackUrl,
                            name: `ai-generated-fallback-${Date.now()}.jpg`
                          }
                        }));

                        setPreviewUrl(fallbackUrl);

                        setMessage({
                          text: "Image générée avec succès (image de secours utilisée)!",
                          type: "success"
                        });
                        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
                      };

                      // Déclencher le chargement de l'image
                      img.src = imageUrlToUse;
                    } else {
                      console.error('Format de réponse inattendu de l\'API d\'image:', generatedImage);

                      // Utiliser une image de secours
                      const fallbackUrl = 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg';

                      setEventData(prev => ({
                        ...prev,
                        eventPicture: {
                          type: 'ai-generated-url',
                          url: fallbackUrl,
                          name: `ai-generated-fallback-${Date.now()}.jpg`
                        }
                      }));

                      setPreviewUrl(fallbackUrl);

                      setMessage({
                        text: "Image générée avec succès (image de secours utilisée)!",
                        type: "success"
                      });
                      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
                    }
                  } catch (error) {
                    console.error('Error generating AI image:', error);
                    setMessage({
                      text: "Error generating image: " + (error.response?.data?.message || error.message),
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
          {/* Afficher l'aperçu de l'image */}
          {(previewUrl || eventData.eventPicture) && (
            <div className="mt-2">
              <p className="text-green-600 mb-2">
                {previewUrl || (eventData.eventPicture && eventData.eventPicture.type === 'ai-generated-url')
                  ? "Image générée par IA"
                  : "Image sélectionnée"}
              </p>
              <img
                src={
                  previewUrl
                  || (eventData.eventPicture && eventData.eventPicture.type === 'ai-generated-url'
                      ? eventData.eventPicture.url
                      : (eventData.eventPicture ? URL.createObjectURL(eventData.eventPicture) : ''))
                }
                alt="Preview"
                className="w-32 h-32 object-cover rounded"
                onError={(e) => {
                  console.error("Erreur de chargement de l'image:", e);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/320x320?text=Image+Preview';
                }}
              />
            </div>
          )}
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Add Event</button>
      </form>
    </div>
  );
};

export default AddEvent;