import { app } from "./app.js";
import dotenv from "dotenv";
import mysql from 'mysql2/promise';
import User from "./models/Users.js";
import Messages from "./models/Message.js";
import File from "./models/File.js";
import Groups from "./models/Group.js";
import Group_Members from "./models/Group_Members.js";
import Friends from "./models/Friends.js";
import http from "http";
import { Server } from "socket.io"
import { initSockets } from "./socket/index.js";

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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }
})

const checkDatabaseConnection = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Successfully Connected to ChatBlizz Database");
  } catch (error) {
    console.error("Unable to connect to the DB:", error);
  }
};

initSockets(io) // Initialize sockets

server.listen(PORT, () => {
  console.log(`Server is running at port: ${PORT}`);
})

await checkDatabaseConnection()

// app.listen(PORT, () => {
//   console.log(`Server is running at port: ${PORT}`);
// });

// Call the following functions to create respective tables

// await User()
// await File()
// await Groups()
// await Group_Members()
// await Messages()
// await Friends()

// test

export { pool }
