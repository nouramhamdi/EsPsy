import React, { useEffect, useState } from "react";
import Card from "../../../../components/card";
import groupServices from "../../../../../Services/groupService";
import { useNavigate } from "react-router-dom";

function GroupTable({ tableData, refreshData }) {
  const [groups, setGroups] = useState(tableData);
  const navigate = useNavigate();
  
  useEffect(() => {
    setGroups(tableData);
  }, [tableData]);

  const handleLockGroup = async (groupId) => {
    try {
      await groupServices.toggleLockGroup(groupId);
      refreshData();
    } catch (error) {
      console.error("Error locking group:", error);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await groupServices.deleteGroup(groupId);
      refreshData();
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const handleShowDetails = (groupId) => {
     navigate(`/admin/grpDetails/${groupId}`);     
  };
  const handleGoToAddGroup = () => {
   navigate("/admin/addGroupPage")
  };

  return (
    <>
    <Card extra={"w-full h-full sm:overflow-auto px-6"}>
      <header className= "relative flex items-center justify-between pt-4">
        <div className="  text-xl font-bold text-navy-700 dark:text-white">
          Groups Table
        </div>
        <button
        className="px-3 py-1 text-sm font-bold text-white bg-blueSecondary rounded hover:bg-indigo-600"
        onClick={handleGoToAddGroup}
        >
            Add New Group
        </button>
      </header>

      <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
        <table className="w-full">
          <thead>
            <tr className="!border-px !border-gray-400">
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">NAME</p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">THEME</p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">MODERATOR</p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">ACTIONS</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, index) => (
              <tr key={index}>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">{group.name}</p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">{group.theme}</p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">{group.moderator.fullname}</p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1 text-sm font-bold text-white bg-blueSecondary rounded hover:bg-indigo-600"
                      onClick={() => handleLockGroup(group._id)}
                    >
                      { group.isLocked ? "locked" : "unlocked" }
                    </button>
                    <button
                      className="px-3 py-1 text-sm font-bold text-white  bg-blueSecondary rounded hover:bg-indigo-600"
                      onClick={() => handleShowDetails(group._id)}
                    >
                       Details
                    </button>
                    <button
                      className="px-3 py-1 text-sm font-bold text-white bg-red-500 rounded hover:bg-red-600"
                      onClick={() => handleDeleteGroup(group._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
    
    </>

  );
}

export default GroupTable;
