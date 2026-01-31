import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const File = sequelize.define('File', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    requestId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'request_id',
        references: {
            model: 'requests',
            key: 'id'
        }
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
    fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'file_name'
    },
    originalName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'original_name'
    },
    fileType: {
        type: DataTypes.ENUM(
            'design_brief',
            'reference',
            'draft',
            'final_deliverable',
            'revision',
            'source_file',
            'other'
        ),
        allowNull: false,
        field: 'file_type'
    },
    mimeType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'mime_type'
    },
    fileSize: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'file_size'
    },
    s3Key: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 's3_key'
    },
    s3Bucket: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 's3_bucket'
    },
    s3Url: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        field: 's3_url'
    },
    thumbnailUrl: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: 'thumbnail_url'
    },
    version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false
    },
    parentFileId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'parent_file_id',
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
    },
    downloadCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'download_count'
    }
}, {
    tableName: 'files',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['request_id'] },
        { fields: ['uploaded_by'] },
        { fields: ['file_type'] },
        { fields: ['parent_file_id'] },
        { fields: ['created_at'] }
    ]
});

export default File;
