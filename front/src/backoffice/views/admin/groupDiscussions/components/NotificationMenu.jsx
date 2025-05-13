import React, { useState, useRef, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import img from "../../../../assets/img/avatars/avatar1.png"
import { io } from "socket.io-client";

const NotificationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  const socket = useRef();
  const [Newnotifications, setNewNotifications] = useState(true);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sample notifications (replace with real data)
  useEffect(() => {
    socket.current = io("http://localhost:5000", {
      transports: ['websocket']
    });

    // Listen for real-time notifications
    socket.current.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    // Request initial notifications
    socket.current.emit("getNotifications", loggedUser._id);
    console.log("Requesting notifications for user:", loggedUser._id,notifications);
    // Listen for initial notifications
    socket.current.on("initialNotifications", (initialNotifications) => {
      setNotifications(initialNotifications);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const handleMarkAsRead = () => {
    setNewNotifications(false);setIsOpen(!isOpen);
  }
  return (
    <div className="fixed bottom-16 right-4 z-50">
      {/* Trigger Button */}
      <button
        onClick={handleMarkAsRead}
        className="bg-[#1977cc] text-white p-3 rounded-full shadow-lg hover:bg-[#1763a7] transition-colors"
      >
        <FaBell size={20} />
        {
          Newnotifications ? 
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                !
            </span> 
            :
            ""
        }
        
      </button>

      {/* Notification Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            ref={menuRef}
            className="fixed bottom-20 right-4 w-80 bg-white rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1977cc] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-white">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <IoMdClose size={24} />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`flex items-start p-4 space-x-3 ${
                    !notif.read ? "bg-gray-50" : ""
                  } hover:bg-gray-100`}
                >
                  {/* Avatar */}
                  <img
                    src={`http://localhost:5000/uploads/${loggedUser.image_user}`}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-sm"><span class="font-bold">{notif.userId.username}</span> {notif.content} in <span class="font-bold">{notif.groupId.name}</span>  </p>
                    <span className="text-xs text-gray-500 mt-1 block">
                      {notif.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationMenu;