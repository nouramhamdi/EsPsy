import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EventServices from "../../../../Services/EventService";

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
  const [message, setMessage] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});

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
        console.error("Error while loading:", err);
        setError("Unable to load event data.");
        setLoading(false);
      }
    };
    
    if (id) {
      fetchEvent();
    }
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
    
    try {
      const formData = new FormData();
      
      Object.keys(eventData).forEach(key => {
        if (!['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) {
          if (key === 'eventPicture') {
            if (image) {
              formData.append('eventPicture', image);
            } else if (eventData.eventPicture) {
              formData.append('eventPicture', eventData.eventPicture);
            }
          } else {
            formData.append(key, eventData[key]);
          }
        }
      });

      await EventServices.updateEvent(id, formData);
      setMessage({ text: "Event has been successfully updated!", type: "success" });
      setTimeout(() => {
        navigate("/admin/EventsManagement", { replace: true });
      }, 2000);
    } catch (err) {
      console.error("Error while updating:", err);
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
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Title:</label>
        <input
          type="text"
          name="title"
          value={eventData.title}
          onChange={handleChange}
          className="w-full p-2 border mb-3"
          required
        />
        {errors.title && <p className="text-red-500">{errors.title}</p>}

        <label className="block mb-2">Description:</label>
        <textarea
          name="description"
          value={eventData.description}
          onChange={handleChange}
          className="w-full p-2 border mb-3"
          required
        />
        {errors.description && <p className="text-red-500">{errors.description}</p>}

        <label className="block mb-2">Type:</label>
        <select
          name="eventType"
          value={eventData.eventType}
          onChange={handleChange}
          className="w-full p-2 border mb-3"
          required
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
          required
        />
        {errors.date && <p className="text-red-500">{errors.date}</p>}

        <label className="block mb-2">Location:</label>
        <input
          type="text"
          name="location"
          value={eventData.location}
          onChange={handleChange}
          className="w-full p-2 border mb-3"
          required
        />
        {errors.location && <p className="text-red-500">{errors.location}</p>}

        <label className="block mb-2">Maximum Participants:</label>
        <input
          type="number"
          name="maxParticipants"
          value={eventData.maxParticipants}
          onChange={handleChange}
          className="w-full p-2 border mb-3"
        />
        {errors.maxParticipants && <p className="text-red-500">{errors.maxParticipants}</p>}

        <label className="block mb-2">Target Audience:</label>
        <select
          name="targetAudience"
          value={eventData.targetAudience}
          onChange={handleChange}
          className="w-full p-2 border mb-3"
          required
        >
          <option value="">Select Target Audience</option>
          <option value="Student">Student</option>
          <option value="Psychologist">Psychologist</option>
          <option value="Teacher">Teacher</option>
          <option value="Students, Teachers and Psychologists">Students, Teachers and Psychologists</option>
        </select>

        <label className="block mb-2">Event Image:</label>
        <input
          type="file"
          name="eventPicture"
          onChange={handleImageChange}
          accept=".jpg,.jpeg,.png"
          className="w-full p-2 border mb-3"
        />
        {errors.image && <p className="text-red-500">{errors.image}</p>}

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Update Event
        </button>
      </form>
    </div>
  );
};

export default UpdateEvent;
