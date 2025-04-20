import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Group_Members = sequelize.define('Group_Members', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true   
    },
    group_id: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    role: {
        type: DataTypes.ENUM('admin','member'),
        defaultValue: 'member'
    },
}, {
    tableName: 'group_members',
    timestamps: true,
    createdAt: 'joined_at',
})

export default Group_Members