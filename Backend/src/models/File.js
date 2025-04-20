import { pool } from "../index.js";

const File = async () => {
  const query = `CREATE TABLE IF NOT EXISTS file (
        id VARCHAR(255) PRIMARY KEY, 
        user_id VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        file_type ENUM('image','video','document'),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
  // also added one more column - receiver_id (varchar 255) NOT NULL directly using workbench
  // Therefore, user_id corresponds to the sender_id in the messages table and receiver_id corresponds to the receiver_id in the messages table
  // foreign key constraint, fk_user_file has been dropped for the sake of simplicity in the initial stage
  try {
    const [fileTable] = await pool.query(query);
    console.log("File table created or exists:");
  } catch (error) {
    console.error("Unable to create file table", error);
  }
};

export default File;
