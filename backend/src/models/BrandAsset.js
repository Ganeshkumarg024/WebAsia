import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BrandAsset = sequelize.define('BrandAsset', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM(
            'logo',
            'color_palette',
            'typography',
            'brand_guidelines',
            'reference_material',
            'other'
        ),
        defaultValue: 'other',
        allowNull: false
    },
    // For colors/typography that are not files
    value: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    },
    // Reference to the File model if it's a file-based asset
    fileId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'file_id',
        references: {
            model: 'files',
            key: 'id'
        }
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'brand_assets',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['type'] },
        { fields: ['is_active'] }
    ]
});

export default BrandAsset;
