import { setSocketId, deleteSocketId } from "../index.js";

const connectUser = (socket) => {
    console.log(`A user connected: ${socket.id}`);
    const userId = socket.user.uid;
    socket.on("register", async () => {
      if (userId) {
        setSocketId(userId, socket.id);
        //userSocketMap[userId] = socket.id;
        console.log(`User ${userId} registered with socket ${socket.id}`);
      }
    },
    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
      deleteSocketId(userId);
      //delete userSocketMap[userId];
    })
  );
};

export default connectUser;
