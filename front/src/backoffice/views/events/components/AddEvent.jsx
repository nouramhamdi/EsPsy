import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EventServices from "../../../../Services/EventService";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
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
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset the time to midnight
    const selectedDate = new Date(eventData.date);
    selectedDate.setHours(0, 0, 0, 0);

    // Validate the title
    if (!eventData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (eventData.title.length < 10) {
      newErrors.title = "Title must contain at least 10 characters";
    } else if (eventData.title.length > 100) {
      newErrors.title = "Title must not exceed 100 characters";
    }

    // Validate the description
    if (!eventData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (eventData.description.length < 10) {
      newErrors.description = "Description must contain at least 10 characters";
    } else if (eventData.description.length > 1000) {
      newErrors.description = "Description must not exceed 1000 characters";
    }

    // Validate the event type
    if (!eventData.eventType) {
      newErrors.eventType = "Event type is required";
    }

    // Validate the date
    if (!eventData.date) {
      newErrors.date = "Date is required";
    } else if (selectedDate < today) {
      newErrors.date = "Date cannot be in the past";
      e.target.date.value = ''; // Reset the date
    }

    // Validate the location
    if (!eventData.location.trim()) {
      newErrors.location = "Location is required";
    } else if (eventData.location.length < 10) {
      newErrors.location = "Location must contain at least 10 characters";
    } else if (eventData.location.length > 100) {
      newErrors.location = "Location must not exceed 100 characters";
    }

    // Validate the number of participants
    const maxParticipants = parseInt(eventData.maxParticipants);
    if (!eventData.maxParticipants) {
      newErrors.maxParticipants = "Maximum number of participants is required";
    } else if (isNaN(maxParticipants) || maxParticipants < 10) {
      newErrors.maxParticipants = "Minimum number of participants must be 10";
    } else if (maxParticipants > 1000) {
      newErrors.maxParticipants = "Maximum number of participants cannot exceed 1000";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const formData = new FormData();
        Object.keys(eventData).forEach((key) => {
          formData.append(key, eventData[key]);
        });

        await EventServices.addEvent(formData);
        setMessage({ 
          text: "Event has been successfully added!", 
          type: "success" 
        });
        setTimeout(() => navigate("/admin/EventsManagement"), 1500);
      } catch (error) {
        setMessage({ 
          text: "Error while adding the event.", 
          type: "error" 
        });
      }
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Add Event</h2>
      {message.text && (
        <div className={`p-4 mb-4 rounded text-center ${
          message.type === "success" ? "bg-green-100 text-green-700 border border-green-400" :
          "bg-red-100 text-red-700 border border-red-400"
        }`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" placeholder="Title" value={eventData.title} onChange={handleChange} required className="w-full p-2 border rounded" />
        {errors.title && <p className="text-red-500">{errors.title}</p>}
        <textarea name="description" placeholder="Description" value={eventData.description} onChange={handleChange} required className="w-full p-2 border rounded" />
        {errors.description && <p className="text-red-500">{errors.description}</p>}
        <select
          name="eventType"
          value={eventData.eventType}
          onChange={handleChange}
          required
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
        <input type="date" name="date" value={eventData.date} onChange={handleChange} required className="w-full p-2 border rounded" />
        {errors.date && <p className="text-red-500">{errors.date}</p>}
        <input type="text" name="location" placeholder="Location" value={eventData.location} onChange={handleChange} required className="w-full p-2 border rounded" />
        {errors.location && <p className="text-red-500">{errors.location}</p>}
        <input type="number" name="maxParticipants" placeholder="Maximum number of participants" value={eventData.maxParticipants} onChange={handleChange} required className="w-full p-2 border rounded" />
        {errors.maxParticipants && <p className="text-red-500">{errors.maxParticipants}</p>}
        <select 
          name="targetAudience" 
          value={eventData.targetAudience} 
          onChange={handleChange} 
          required 
          className="w-full p-2 border rounded"
        >
          <option value="">Select Target Audience</option>
          <option value="Student">Student</option>
          <option value="Psychologist">Psychologist</option>
          <option value="Teacher">Teacher</option>
          <option value="Students, Teachers and Psychologists">Students, Teachers and Psychologists</option>
        </select>
        <input 
          type="file" 
          name="eventPicture" 
          onChange={handleImageChange}
          accept=".jpg,.jpeg,.png"
          className="w-full p-2 border rounded" 
        />
        {errors.image && <p className="text-red-500">{errors.image}</p>}
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Add Event</button>
      </form>
    </div>
  );
};

export default AddEvent;