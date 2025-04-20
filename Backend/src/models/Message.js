import { pool } from "../index.js";

const Messages = async () => {
  const query = `CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(255) PRIMARY KEY,
        sender_id VARCHAR(255) NOT NULL,
        receiver_id VARCHAR(255) NULL,
        group_id VARCHAR(255) NULL,
        message TEXT,
        file_id VARCHAR(255),
        message_type ENUM('text','image','file'),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_groupKey FOREIGN KEY (group_id) REFERENCES \`groups\`(id) ON DELETE CASCADE
      )`;
      // added two more columns, delivered (boolean) and delivered_at (timestamp) directly using workbench
      // foreign key constraint, fk_file has been dropped for the sake of simplicity in the initial stage 
      // added one more column, fileName varchar(255) directly using workbench
      try {
    const [messageTable] = await pool.query(query);
    console.log("Message table created or already exists:");
  } catch (error) {
    console.error("Error creating messages table: ", error);
  }
};

export default Messages;


