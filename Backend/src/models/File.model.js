import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize.js";

const File = sequelize.define('File', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    receiver_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_type: {
        type: DataTypes.ENUM('image', 'video', 'document')
    },
}, {
    tableName: 'file',
    timestamps: true,
    createdAt: 'uploaded_at',
    updatedAt: false
})

export default File