import { saveMessage } from "../db/queries.js";

const activeUsers = new Map();

const initHandlers = (io, socket) => {
  socket.on("register", (userId) => {
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log(`A user disconnected with socketId ${socket.id}`);
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        console.log(`User ${userId} has been removed from the list of active users`);
        break;
      }
    }
  });

  socket.on("send_message", async (data) => {
    const { sender_id, receiver_id, content } = data;
    console.log(`Data received in send message --- > sender_id: ${sender_id}, receiver_id: ${receiver_id}, content: ${content}`)
    try {
      const message = await saveMessage(sender_id, receiver_id, content);
      const receiverSocketId = activeUsers.get(receiver_id);
      if (receiverSocketId)
        io.to(receiverSocketId).emit("receive_message", message);
    } catch (error) {
      console.error("Error sending message: ", error);
      socket.emit("message_error", "Failed to send message");
    }
  });
};

export { initHandlers }




