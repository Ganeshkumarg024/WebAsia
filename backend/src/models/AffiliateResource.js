import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AffiliateResource = sequelize.define('AffiliateResource', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.ENUM('banner', 'social', 'email', 'video', 'other'),
        defaultValue: 'banner'
    },
    fileUrl: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'file_url'
    },
    thumbnailUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'thumbnail_url'
    },
    fileName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'file_name'
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'file_size',
        comment: 'File size in bytes'
    },
    fileType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'file_type',
        comment: 'MIME type'
    },
    dimensions: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'e.g., 1200x630'
    },
    uploadedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'uploaded_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    downloadCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'download_count'
    }
}, {
    tableName: 'affiliate_resources',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['category'] },
        { fields: ['is_active'] },
        { fields: ['uploaded_by'] }
    ]
});

export default AffiliateResource;
