import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const Groups = sequelize.define('Groups', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true   
    },
    group_name: {
        type: DataTypes.STRING(100),
        allowNull: false 
    },
    admin_id: {
        type: DataTypes.STRING,
        allowNull: false 
    }
}, {
    tableName: 'groups',
    timestamps: true,
    createdAt: 'created_at',
})

export default Groups