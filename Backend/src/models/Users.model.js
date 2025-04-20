import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Users = sequelize.define('Users', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true   
    },
    fireBaseID: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false 
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false 
    },
    email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
    },
    avatar: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('online', 'offline'),
        defaultValue: 'offline'
    },
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'lastupdate'
})

export default Users
