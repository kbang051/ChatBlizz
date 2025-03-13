import { pool } from "../index.js";

const File = async () => {
  const query = `CREATE TABLE IF NOT EXISTS file (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        file_type ENUM('image','video','document'),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user_file FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`;

  try {
    const [fileTable] = await pool.query(query);
    console.log("File table created or exists:", fileTable);
  } catch (error) {
    console.error("Unable to create file table", error);
  }
};

export default File;
