import { pool } from "../index.js";

const Friends = async () => {
    const query = `CREATE TABLE IF NOT EXISTS friends (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    friend_id VARCHAR(255) NOT NULL,
    status ENUM('pending','accepted','rejected', 'unknown') DEFAULT 'unknown',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friend_id FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
    )`;

    try {
        const [friendsTable] = await pool.query(query);
        console.log("Friends table created or already exists:");
    } catch (error) {
        console.error("Error creating friends table:", error);
    }
}

export default Friends;