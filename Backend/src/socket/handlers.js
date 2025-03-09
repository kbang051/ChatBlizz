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
        activeUsers.delete(socketId);
        console.log(`User ${userId} has been removed from the list of active users`);
        break;
      }
    }
  });

  socket.on("send_message", async (data) => {
    const { sender_id, receiver_id, content } = data;
    const message = await saveMessage(sender_id, receiver_id, content);
    const receiverSocketId = activeUsers.get(receiver_id);
    if (receiverSocketId)
      io.to(receiverSocketId).emit("receive_message", message);
  });
};

export { initHandlers }
