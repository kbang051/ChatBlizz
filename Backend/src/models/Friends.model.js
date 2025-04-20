import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Friends = sequelize.define('Friends', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true   
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    friend_id: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    status: {
        type: DataTypes.ENUM('pending','accepted','rejected', 'unknown'),
        defaultValue: 'unknown'
    },
}, {
    tableName: 'friends',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
})

export default Friends