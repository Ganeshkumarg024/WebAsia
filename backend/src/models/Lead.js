
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Lead extends Model { }

Lead.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    company: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contactName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    projectType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('new', 'contacted', 'quoted', 'won', 'lost'),
        defaultValue: 'new'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Lead',
    tableName: 'leads',
    timestamps: true, // adds createdAt and updatedAt
    underscored: true
});

export default Lead;
