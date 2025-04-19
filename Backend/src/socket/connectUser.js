import { userSocketMap } from "../index.js";

const connectUser = (socket) => {
  console.log(`A user connected: ${socket.id}`);
  const userId = socket.user.uid;
  socket.on("register", async () => {
      if (userId) {
        userSocketMap[userId] = socket.id;
        console.log(`User ${userId} registered with socket ${socket.id}`);
      }
    },
    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
      delete userSocketMap[userId];
    })
  );
};

export default connectUser;
