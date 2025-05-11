import dotenv from "dotenv";
import mysql from 'mysql2/promise';
import http from "http";
import checkTables from "./utils/SQLTableCreation.js";
import socketAuth from "./middlewares/verifySocketConnection.middleware.js";
import connectUser from "./socket/connectUser.js";
import sequelize from "./db/sequelize.js";

import { createKafkaTopic, startMessageConsumer } from "./services/kafka.js";
import startSubscriber from "./socket/subscribe.js";

import { redis, sub } from "./db/redisClient.js";
import { Server } from "socket.io"
import { app } from "./app.js";
 
dotenv.config({
  path: "./env",
});

const PORT = process.env.PORT || 8000;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 15,
  waitForConnections: true
});

const checkDatabaseConnection = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Successfully Connected to ChatBlizz Database");
    //redis
    await redis.ping();
    console.log("Redis ping successful!!");
  } catch (error) {
    console.error("Unable to connect to the DB:", error);
    process.exit(1);
  }
};

await createKafkaTopic();
await startMessageConsumer();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }
})

const userSocketMap = {} // {userId: socketId}

const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
}

const setSocketId = (userId, socketId) => {
  userSocketMap[userId] = socketId;
}

const deleteSocketId = (userId) => {
  delete userSocketMap[userId];
}

io.use(socketAuth);
io.on("connection", connectUser);

await startSubscriber();

await checkDatabaseConnection().then(async () => {
  console.log("Connection has been established successfully with sequelize");
  await checkTables();
  server.listen(PORT, () => {
    console.log(`Server is running at port: ${PORT}`);
  });
  console.log("chechTables working successfully.")
}).catch((error) => {
  console.log("Failed to form connection with MySQL database", error);
  process.exit(1);
});

// await checkDatabaseConnection();

export { pool, io, getReceiverSocketId, setSocketId, deleteSocketId };



// sequelize
//   .authenticate()
//   .then(async () => {
//     console.log("Connection has been established successfully with sequelize");
//     await checkTables();
//     server.listen(PORT, () => {
//       console.log(`Server is running at port: ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.log("Failed to form connection with MySQL database", error);
//     process.exit(1);
//   });