import { pool } from "../index.js";

const Groups = async () => {
  const query = `CREATE TABLE IF NOT EXISTS \`groups\` (
    id BINARY(16) PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    admin_id BINARY(16) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE)`;

  try {
    const [groupTable]= await pool.query(query);
    console.log("Group table created or already exists:", groupTable);
  } catch (error) {
    console.error("Unable to create group table", error);
  }
};

export default Groups;
