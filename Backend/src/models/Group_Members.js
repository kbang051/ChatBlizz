import { pool } from "../index.js";

const Group_Members = async () => {
  const query = `CREATE TABLE IF NOT EXISTS group_members (
    id VARCHAR(255) PRIMARY KEY,
    group_id VARCHAR(255) NOT NULL, 
    user_id VARCHAR(255) NOT NULL, 
    role ENUM('admin', 'member') DEFAULT 'member', 
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES \`groups\`(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`;

  try {
    const [groupMembersTable] = await pool.query(query); 
    console.log("groupMembers table created or already exists:");
  } catch (error) {
    console.error("Error creating groupMembers table:", error);
  }
};

export default Group_Members;