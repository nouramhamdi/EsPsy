import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import groupServices from "../../../../Services/groupService";
import userServices from "../../../../Services/UserService";

import { FaUser, FaRegCalendarAlt, FaCog } from 'react-icons/fa'; 
import Card from 'backoffice/components/card';
import Chat from './components/Chat';

const GroupDetails = () => {
  const { id } = useParams(); 
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSeeChat, setIsSeeChat] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false); 
  const [Students, setStudents] = useState([]); 

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const fetchedGroup = await groupServices.getGroupById(id); 
        setGroup(fetchedGroup.data);
      } catch (error) {
        console.error("Error fetching group details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [id]);

  useEffect(() => {
    if (isAddMemberOpen) {
      const fetchStudents = async () => {
        try {
          const response = await userServices.getAllUsers();
          const filteredStudents = response.users.filter(
            (user) => user.role === 'student'
          );
          setStudents(filteredStudents);
        } catch (error) {
          console.error("Error fetching students:", error);
        }
      };
      
      fetchStudents();
    }
  }, [isAddMemberOpen]);

  // Delete member function
  const handleDeleteMember = async (memberId) => {
    try {
      await groupServices.deleteMemberFromGroup(id, memberId); // Call the delete member API
      const updatedGroup = { ...group };
      updatedGroup.members = updatedGroup.members.filter((member) => member._id !== memberId); // Remove deleted member from state
      setGroup(updatedGroup);
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const memberId = e.target.memberId.value;
    console.log('====================================');
    console.log('memberId:', memberId);
    console.log('====================================');
    try {
      await groupServices.addMemberToGroup(id, memberId);
      setIsAddMemberOpen(false);
      const updatedGroup = await groupServices.getGroupById(id);
      setGroup(updatedGroup.data);
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const toggleChat = () => {
    setIsSeeChat(!isSeeChat)
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
        <div className=" mt-6 grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2 mb-10">
      {group && (
        <Card extra="w-full max-w-lg mx-auto  p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{group.name}</h2>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black dark:text-white">Theme</h3>
            <p className="text-gray-600 dark:text-white">{group.theme}</p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black dark:text-white">Moderator</h3>
            <div className="flex items-center gap-2">
              <FaUser className="text-gray-600 dark:text-white" />
              <p className="text-gray-600 dark:text-white">{group.moderator.fullname}</p>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black dark:text-white">Creator</h3>
            <div className="flex items-center gap-2 ">
              <FaUser className="text-gray-600 dark:text-white" />
              <p className="text-gray-600 dark:text-white">{group.creator.fullname}</p>
            </div>
          </div>
          <hr />
          <div className="mb-4 mt-2">
            <h3 className="text-lg text-center font-semibold text-black">Actions</h3>
            <div className="flex items-center justify-center gap-2 mt-3">
            <button
              className="px-3 py-1 text-sm font-bold text-white  bg-blueSecondary rounded hover:bg-indigo-600"              
              onClick={() => setIsAddMemberOpen(true)}
              >
               Add New Member
            </button>
            <button
              className="px-3 py-1 text-sm font-bold text-white  bg-blueSecondary rounded hover:bg-indigo-600"              
              onClick={() => setIsSeeChat(true)}
           >
               See Chat
            </button>
            </div>
          </div>
        </Card>
      )
      }

      <Card extra="w-full max-w-lg mx-auto  p-6 rounded-lg">

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-black">Members List</h3>
          <div className="overflow-x-auto mt-4">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="border-b p-2 text-left">Full Name</th>
                  <th className="border-b p-2 text-left">Email</th>
                  <th className="border-b p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {group.members && group.members.map((member) => (
                  <tr key={member._id}>
                    <td className="border-b p-2">{member.fullname}</td>
                    <td className="border-b p-2">{member.email}</td>
                    <td className="border-b p-2">
                      <button
                        className="px-3 py-1 text-sm font-bold text-white bg-red-500 rounded hover:bg-red-600"
                        onClick={() => handleDeleteMember(member._id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

    </div>
      {isAddMemberOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 bg-transparent backdrop-blur-md"
            onClick={() => setIsAddMemberOpen(false)}
          />
          <Card extra="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-lg w-full p-6 rounded-lg z-50 bg-white ">
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add New Member</h3>
              <button 
                className="text-brand-600 hover:text-brand-500"
                onClick={() => setIsAddMemberOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Student</label>
                <select
                  name="memberId"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blueSecondary z-50"
                  required
                >
                  <option value="">Select a student</option>
                  {Students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.fullname}
                    </option>
                  ))}
                </select>

              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  className="px-4 py-2 text-white  bg-purple-700 rounded-lg hover:bg-purple-500"
                  onClick={() => setIsAddMemberOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-blueSecondary rounded-lg hover:bg-indigo-700"
                >
                  Add Member
                </button>
              </div>
            </form>
          </Card>
        </>
      )}
      
       {isSeeChat 
          ? <Chat GroupId={id} openChat={isSeeChat} toggleChat={toggleChat} />
          : null
       }
        

    </>


  );
};

export default GroupDetails;
