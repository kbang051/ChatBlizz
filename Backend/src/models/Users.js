import { pool } from "../index.js";

const User = async () => {
  const query = `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, 
    fireBaseID VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL, 
    email VARCHAR(100) UNIQUE NOT NULL, 
    avatar VARCHAR(255), 
    status ENUM('online','offline') DEFAULT 'offline', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    lastupdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  )`;
  try {
    const [userTable] = await pool.query(query); // Executes the query
    console.log("User table created or already exists:");
  } catch (error) {
    console.error("Error creating user table:", error);
  }
};

export default User;



