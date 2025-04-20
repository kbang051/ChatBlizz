import { pool } from "../index.js";

const Groups = async () => {
  const query = `CREATE TABLE IF NOT EXISTS \`groups\` (
    id VARCHAR(255) PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    admin_id VARCHAR(255) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE)`;

  try {
    const [groupTable]= await pool.query(query);
    console.log("Group table created or already exists:");
  } catch (error) {
    console.error("Unable to create group table", error);
  }
};

export default Groups;
