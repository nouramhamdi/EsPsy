import React, { useEffect, useState } from 'react';
import userServices from '../../../../Services/UserService'; // Adjust the path as needed
import DailyTraffic from '../default/components/DailyTraffic';
import PieChartCard from '../default/components/PieChartCard';
import UserTable from './components/Tableuser';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showPending, setShowPending] = useState(false); // Track the current view

  const fetchData = async () => {
    try {      
      if(showPending){
        setUsers([]);
        const data = await userServices.GetPendingRequests()
        if(data.users && data.users.length>0){
          setUsers(data.users);
        }
        else{
          setUsers([]);
          setShowPending(false); 
        }
      }  
      else{
        const data = await userServices.getAllUsers()
        setUsers(data.users);
      }

    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchData();
  }, [showPending]); // Refetch when showPending changes

  // Function to toggle between all users and pending requests
  const handleShowPendingRequest = () => {
    setShowPending(!showPending); // Switch to pending requests view
  };
  
  return (
    <div>
      {/* Users Stats */}
      <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2 mb-10">
        <DailyTraffic />
        <PieChartCard tableData={users} />
      </div>
      {/* User Table */}
      <UserTable tableData={users} ShowPendingRequests={handleShowPendingRequest} refreshData={fetchData} showPending={showPending}/>
    </div>
  );
};

export default Users;
