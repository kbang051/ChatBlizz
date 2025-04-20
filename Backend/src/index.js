import dotenv from "dotenv";
import mysql from 'mysql2/promise';
import http from "http";
import checkTables from "./utils/SQLTableCreation.js";
import socketAuth from "./middlewares/verifySocketConnection.middleware.js";
import connectUser from "./socket/connectUser.js";
import sequelize from "./db/sequelize.js";
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
  } catch (error) {
    console.error("Unable to connect to the DB:", error);
  }
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }
})

const getReceiverSocketId = (userId) => {
  return userSocketMap[userId]
}

const userSocketMap = {} // {userId: socketId}

io.use(socketAuth);
io.on("connection", connectUser);

sequelize
  .authenticate()
  .then(async () => {
    console.log("Connection has been established successfully with sequelize");
    await checkTables();
    server.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Failed to form connection with MySQL database", error);
    process.exit(1);
  });

await checkDatabaseConnection()

export { pool, io, getReceiverSocketId, userSocketMap }


