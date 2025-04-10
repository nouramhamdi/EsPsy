import React, { useState, useEffect } from "react";
import groupServices from "../../Services/groupService"; // Adjust the import path
import Chat from "backoffice/views/admin/groupDiscussions/components/Chat";

const GroupList = () => {
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
    <section id="services" className="services section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Support Group List</h2>
      </div>

      <div className="container">
        <div className="row gy-4">
          {groups.map((group) => (
            <div
              key={group._id}
              className="col-lg-4 col-md-6"
              data-aos="fade-up"
              data-aos-delay="100"
              onClick={() => handleGroupClick(group._id)}
            >
              <div className="service-item position-relative">
                <div className="icon">
                  <i className="fas fa-heartbeat"></i>
                </div>
                <a href="#" className="stretched-link">
                  <h3>{group.name}</h3>
                </a>
                <p>{group.theme || "No theme description"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isSeeChat && (
        <Chat
          GroupId={selectedGroupId}
          openChat={isSeeChat}
          toggleChat={() => setIsSeeChat(false)}
        />
      )}
    </section>
  );
};

export default GroupList;