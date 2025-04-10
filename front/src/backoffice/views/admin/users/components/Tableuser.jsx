import React, { useEffect, useState } from "react";
import CardMenu from "../../../../components/card/CardMenu";
import Card from "../../../../components/card";
import userServices from "../../../../../Services/UserService"

function UserTable({ tableData ,ShowPendingRequests , refreshData , showPending}) {
  const [users, setUsers] = useState(tableData);

  useEffect(() => {
    setUsers(tableData);
    
  }, [tableData]);

  
  const handleBlockUser = async (userId) => {
    try {
      await userServices.blockUser(userId);
      refreshData();
      
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await userServices.unblockUser(userId);
      refreshData();
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      console.log(`Changing role for user with ID: ${userId} to ${newRole}`);
      
      await userServices.changeUserRole(userId, newRole);
      refreshData();
      
      
    } catch (error) {
      console.error('Role change failed:', error);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await userServices.AcceptRequest(userId);
      console.log("Request accepted successfully!");
      refreshData(); 
    } catch (error) {
      console.log("Failed to accept request: " + error.message);
    } 
  };
  const handleCancelRequest = async (userId) => {
    try {
      await userServices.CancelRequest(userId);
      console.log("Request canceled successfully!");
      refreshData(); 
    } catch (error) {
      console.log("Failed to cancel request: " + error.message);
    } 
  };

  return (
    <Card extra={"w-full h-full sm:overflow-auto px-6"}>
      <header className="relative flex items-center justify-between pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Users Table
        </div>
        <CardMenu ShowPendingRequests={ShowPendingRequests} showPending={showPending}/>
      </header>

      <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
        <table className="w-full">
          <thead>
            <tr className="!border-px !border-gray-400">
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  FULL NAME
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  USERNAME
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  EMAIL
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  DATE OF BIRTH
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  PHONE NUMBER
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  ROLE
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  ACTIONS
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {user.fullname}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {user.username}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {user.email}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                  {new Date(user.datebirth).toLocaleDateString()}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {user.number}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {user.role}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <div className="flex items-center gap-2">
                    {/* If showPending is true, show Accept and Cancel buttons */}
                    {showPending ? (
                      <>
                        <button
                          className="px-3 py-1 text-sm font-bold text-white bg-green-500 rounded hover:bg-green-600"
                          onClick={() => handleAcceptRequest(user._id)}
                        >
                          Accept 
                        </button>
                        <button
                          className="px-3 py-1 text-sm font-bold text-white bg-red-500 rounded hover:bg-red-600"
                          onClick={() => handleCancelRequest(user._id)}
                        >
                          Cancel 
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Block/Unblock Button */}
                        {user.blocked ? (
                          <button
                            className="px-3 py-1 text-sm font-bold text-white bg-blueSecondary rounded hover:bg-navy-500"
                            onClick={() => handleUnblockUser(user._id)}
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            className="px-3 py-1 text-sm font-bold text-white bg-red-500 rounded hover:bg-red-600"
                            onClick={() => handleBlockUser(user._id)}
                          >
                            Block
                          </button>
                        )}

                        {/* Role Selection Dropdown */}
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user._id, e.target.value)}
                          className="px-2 py-1 text-sm font-bold text-white bg-indigo-500 rounded dark:bg-indigo-500 dark:text-white"
                        >
                          <option value="admin">Admin</option>
                          <option value="student">Student</option>
                          <option value="psychologist">Psychologist</option>
                          <option value="teacher">Teacher</option>
                        </select>
                      </>
                    )}
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default UserTable;