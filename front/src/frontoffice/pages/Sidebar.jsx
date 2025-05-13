import React, { useState, useEffect } from "react";
import groupServices from "../../Services/groupService";
import Chat from "backoffice/views/admin/groupDiscussions/components/Chat";

const Groupname = () => {
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  const [groups, setGroups] = useState([]);
  const [isSeeChat, setIsSeeChat] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const memberGroups = await groupServices.getGroupsByIdMember(loggedUser._id);
        setGroups(memberGroups);
      } catch (error) {
        console.error("Failed to fetch groups:", error);
      }
    };
    fetchGroups();
  }, [loggedUser._id]);

  const handleGroupClick = (groupId) => {
    setSelectedGroupId(groupId);
    setIsSeeChat(true);
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <ul className="space-y-2">
        {groups.map((group) => (
          <li
            key={group._id}
            onClick={() => handleGroupClick(group._id)}
            className="text-sm px-3 py-2 bg-white rounded hover:bg-gray-100 cursor-pointer shadow-sm"
          >
            {group.name}
          </li>
        ))}
      </ul>

      {isSeeChat && (
        <Chat
          GroupId={selectedGroupId}
          openChat={isSeeChat}
          toggleChat={() => setIsSeeChat(false)}
        />
      )}
    </div>
  );
};

export default Groupname;
