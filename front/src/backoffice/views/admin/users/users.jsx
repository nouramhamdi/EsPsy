import React, { useEffect, useState } from 'react';
import userServices from '../../../../Services/UserService'; // Adjust the path as needed
import DailyTraffic from '../default/components/DailyTraffic';
import PieChartCard from '../default/components/PieChartCard';
import UserTable from './components/Tableuser';

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {

    // Users.jsx
    const fetchUsers = async () => {
      try {
        const data = await userServices.getAllUsers();
        setUsers(data.users); // Access the 'users' array from response data
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      {/* Users Stats */}
      <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2 mb-10">
        <DailyTraffic />
        <PieChartCard  />
      </div>
      {/* User Table */}
      <UserTable tableData={users} />
    </div>
  );
};

export default Users;
