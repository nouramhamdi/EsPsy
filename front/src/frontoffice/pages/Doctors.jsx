import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserService from '../../Services/UserService'; // Adjust the import path

const Doctors = () => {
  const { speciality } = useParams();
  const [psychologists, setPsychologists] = useState([]);
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        const data = await UserService.getAllUsers();
        const allUsers = data.users
        const filteredByRole = allUsers.filter(user => user.role === 'psychologist');
        setPsychologists(filteredByRole);
        // Apply speciality filter if provided
        if (speciality) {
          const filteredBySpeciality = filteredByRole.filter(doc => doc.speciality === speciality);
          setFilterDoc(filteredBySpeciality);
        } else {
          setFilterDoc(filteredByRole);
        }
      } catch (error) {
        console.error('Error fetching psychologists:', error);
      }
    };
    fetchPsychologists();
  }, [speciality]);

  return (
    <div>
      <div className='d-flex flex-column flex-sm-row align-items-start gap-3 mt-3'>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`btn btn-outline-primary btn-sm d-sm-none ${showFilter ? 'active' : ''}`}
        >
          Filters
        </button>

        <div className='w-100 row g-3 flex justify-center items-center'>
          {filterDoc.map((doctor) => (
            <div
              key={doctor._id} // Assuming MongoDB _id is used
              onClick={() => {
                navigate(`/app/appointment/${doctor._id}`);
                window.scrollTo(0, 0);
              }}
              className="w-full md:w-1/3 border-primary rounded overflow-hidden cursor-pointer shadow-sm transition-transform hover:-translate-y-3"
            >
<img className='card-img-top bg-light' src="/assets/img/doc1.png" alt={doctor.fullname} />
<div className='card-body'>
                <div className={`d-flex align-items-center gap-2 text-sm text-center ${doctor.available ? 'text-success' : 'text-secondary'}`}>
                  <p className={`rounded-circle ${doctor.available ? 'bg-success' : 'bg-secondary'}`} style={{ width: '10px', height: '10px' }}></p>
                  <p>{doctor.available ? 'Available' : 'Not Available'}</p>
                </div>
                <p className='text-dark fw-medium fs-5'>{doctor.fullname}</p>
                <p className='text-muted fs-6'>{doctor.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Doctors;