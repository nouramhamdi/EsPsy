import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupFormCard from './components/GroupFormCard'; // Import the form card
import toast from 'react-hot-toast';
import Card from 'backoffice/components/card';

const AddGroup = () => {
  const navigate = useNavigate();

  const handleGroupCreationSuccess = () => {
    toast.success("Group created successfully");
    navigate('/admin/GroupsManagment'); // Navigate back to the groups management page
  };

  return (
    <div className="container mt-5">
      <Card className="p-4">
        <GroupFormCard onSuccess={handleGroupCreationSuccess} />
      </Card>
    </div>
  );
};

export default AddGroup;
