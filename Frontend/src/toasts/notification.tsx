import React from "react";
import { useChatStore } from "../store/useChatStore.ts";

interface Notification {
  id: string;
  sender_id: string,
  message: string,
  filename: string,
  created_at: string;
}

interface Props {
  notification: Notification;
  closeToast?: () => void;
}

const NotificationToast: React.FC<Props> = ({ notification, closeToast }) => {
  const { selectedUser ,setSelectedUser } = useChatStore();
  return (
    <div onClick={() => (selectedUser !== notification.sender_id) && setSelectedUser(notification.sender_id)}> 
      <p>
        <strong>{notification.sender_id}</strong>: {notification.message}
      </p>
      <p style={{ fontSize: "0.75rem", color: "#666" }}>
        {new Date(notification.created_at).toLocaleString()}
      </p>
      <button
        onClick={closeToast}
        style={{ color: "blue", fontSize: "0.8rem", marginTop: "0.25rem" }}
      >
        Close
      </button>
    </div>
  );
};

export default NotificationToast;