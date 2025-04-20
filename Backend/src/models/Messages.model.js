import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Messages = sequelize.define('Messages', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true   
    },
    sender_id: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    receiver_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    group_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
    },
    file_id: {
        type: DataTypes.STRING,
    },
    message_type: {
        type: DataTypes.ENUM('text','image','file'),
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    delivered: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    delivered_at: {
        type: DataTypes.DATE
    },
    fileName: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
})

export default Messages