import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserService from '../../Services/UserService';
import { FiFilter, FiStar, FiClock, FiMapPin, FiUser, FiX, FiMessageSquare } from 'react-icons/fi';

const RatingModal = ({ psychologist, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
 
  
  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    onSubmit(psychologist._id, rating, comment);
  };
  const getImageUrl = (user) => {
    console.log("User for image:", user);
    return user?.image_user
      ? `https://espsy.onrender.com/uploads/${user.image_user}`
      : "https://via.placeholder.com/40";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Share Your Feedback</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-4">
            <img 
              src={getImageUrl(psychologist)}
              alt={psychologist.fullname}
              className="w-12 h-12 rounded-full object-cover mr-3"
              onError={(e) => e.target.src = "/assets/img/default-profile.png"}
            />
            <div>
              <h4 className="font-semibold">{psychologist.fullname}</h4>
              <p className="text-sm text-gray-600">{psychologist.speciality}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              How would you rate your experience?
            </label>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-full transition-all ${
                    star <= (hoverRating || rating) 
                      ? 'bg-yellow-100 text-yellow-500' 
                      : 'text-gray-300'
                  }`}
                >
                  <FiStar
                    size={24}
                    fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <FiMessageSquare className="text-gray-500 mr-2" />
              <label className="text-sm font-medium text-gray-700">
                Add details about your experience (optional)
              </label>
            </div>
            <textarea
              placeholder="What did you like or dislike about the session?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="w-full bg-[var(--accent-color)] text-[var(--contrast-color)] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Doctors = () => {
  const { speciality } = useParams();
  const navigate = useNavigate();
  const [psychologists, setPsychologists] = useState([]);
  const [filteredPsychologists, setFilteredPsychologists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState(null);
  const getImageUrl = (user) => {
    console.log("User for image:", user);
    return user?.image_user
      ? `https://espsy.onrender.com/uploads/${user.image_user}`
      : "https://via.placeholder.com/40";
  };
  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        const data = await UserService.getAllUsers();
        const allUsers = data.users || [];
        const psychs = allUsers.filter(user => user.role === 'psychologist');
        
        setPsychologists(psychs);
        
        let filtered = psychs;
        if (speciality) {
          filtered = filtered.filter(doc => 
            doc.speciality?.toLowerCase().includes(speciality.toLowerCase())
          );
        }
        if (searchTerm) {
          filtered = filtered.filter(doc => 
            doc.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.speciality?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setFilteredPsychologists(filtered);
      } catch (error) {
        console.error('Error fetching psychologists:', error);
      }
    };
    
    fetchPsychologists();
  }, [speciality, searchTerm]);

  const handleRatePsychologist = async (psychologistId, rating, comment) => {
    try {
      await UserService.ratePsychologist(psychologistId, { rating, comment });
      setFilteredPsychologists(prev => prev.map(psych => {
        if (psych._id === psychologistId) {
          const newRatings = [...(psych.ratings || []), { rating, comment }];
          const totalRatings = newRatings.reduce((sum, r) => sum + r.rating, 0);
          const averageRating = totalRatings / newRatings.length;
          
          return {
            ...psych,
            averageRating,
            ratings: newRatings
          };
        }
        return psych;
      }));
      setShowRatingModal(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const renderStars = (averageRating) => {
    const roundedRating = Math.round(averageRating || 0);
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={`${i < roundedRating ? 'text-yellow-400' : 'text-gray-300'} w-4 h-4`}
        fill={i < roundedRating ? 'currentColor' : 'none'}
      />
    ));
  };
 
  return (
    
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
      <div className="container section-title" data-aos="fade-up">
        <h2>Our Psychologists</h2>
      </div>
        <p className="text-gray-600 mb-6">
          {filteredPsychologists.length} professionals available
        </p>
        
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by name or specialty..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FiFilter className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {filteredPsychologists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPsychologists.map((psychologist) => (
            <div
              key={psychologist._id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 bg-gradient-to-r from-blue-50 to-blue-100">
                <img
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-32 w-32 rounded-full border-4 border-white object-cover shadow-md"
                  src={getImageUrl(psychologist)}
                  alt={psychologist.fullname}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/img/default-profile.png";
                  }}
                />
              </div>

              <div className="p-6 pt-16 text-center">
                <div className="flex justify-center items-center mb-1">
                  {renderStars(psychologist.averageRating)}
                  <span className="text-xs text-gray-500 ml-1">
                    ({psychologist.ratings?.length || 0} reviews)
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-1">{psychologist.fullname}</h3>
                <p className="text-blue-600 font-medium mb-4">{psychologist.speciality}</p>

                <div className="flex justify-center space-x-3 mt-6">
                  <button 
                    className="w-full bg-[var(--accent-color)] text-[var(--contrast-color)] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    onClick={() => navigate(`/app/appointment/${psychologist._id}`)}
                  >
                    Book Session
                  </button>
                  <button
                    className="flex-1 bg-white text-[var(--accent-color)] px-4 py-2 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPsychologist(psychologist);
                      setShowRatingModal(true);
                    }}
                  >
                    <FiStar className="mr-2" />
                    Rate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner mb-4">
            <FiUser className="text-3xl text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-600">
            {searchTerm ? 'No matching psychologists found' : 'No psychologists available'}
          </h3>
          <p className="text-gray-400 mt-1">
            {searchTerm ? 'Try a different search term' : 'Please check back later'}
          </p>
        </div>
      )}

      {showRatingModal && selectedPsychologist && (
        <RatingModal
          psychologist={selectedPsychologist}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatePsychologist}
        />
      )}
    </div>
  );
};

export default Doctors;