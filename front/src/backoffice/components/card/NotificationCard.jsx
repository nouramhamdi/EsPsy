import { useEffect } from "react";
import Card from "./index";
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from "react-icons/md";

const NotificationCard = ({ message, type = "info", onClose, show }) => {
  // Icon configuration based on type
  const iconConfig = {
    success: {
      icon: <MdCheckCircle />,
      color: "#4CAF50" // Green
    },
    error: {
      icon: <MdError />,
      color: "#f44336" // Red
    },
    warning: {
      icon: <MdWarning />,
      color: "#ff9800" // Orange
    },
    info: {
      icon: <MdInfo />,
      color: "#2196F3" // Blue
    }
  };

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const notificationStyle = {
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 9999,
    minWidth: '300px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    margin: 0,
    float: 'none',
    clear: 'none',
    animation: 'slideAndFade 4s ease-in-out forwards'
  };

  return (
    <Card 
      extra="fixed-notification"
      variant="notification"
      style={notificationStyle}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span 
            style={{ color: iconConfig[type].color }}
            className="text-2xl"
          >
            {iconConfig[type].icon}
          </span>
          <span className="text-xl font-bold" style={{ color: iconConfig[type].color }}>
            {message}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="ml-4"
          style={{ color: iconConfig[type].color }}
        >
          <MdClose className="w-6 h-6" />
        </button>
      </div>
    </Card>
  );
};

export default NotificationCard;