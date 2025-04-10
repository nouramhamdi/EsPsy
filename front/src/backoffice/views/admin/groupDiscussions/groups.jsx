import React, { useEffect, useState } from 'react';
import groupServices from '../../../../Services/groupService'; // Adjust the path as needed
import GroupTable from './components/GroupTable';
import NotificationMenu from './components/NotificationMenu';

const Groups = () => {
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));  
  const [groups, setGroups] = useState([]);

  const fetchData = async () => {
    try {
      const response = await groupServices.getGroupsByCreator(loggedUser._id);
      setGroups(response.data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  useEffect(() => {
    if (loggedUser) {
      fetchData();
    }
  },[]);

  return (
    <div className='mt-8'>
      {/* Groups Table */}
      <GroupTable tableData={groups} refreshData={fetchData} />
      <NotificationMenu/>
    </div>
  );


};

export default Groups;
