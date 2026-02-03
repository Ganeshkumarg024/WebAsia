import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BrandKit = sequelize.define('BrandKit', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    logoUrl: {
        type: DataTypes.STRING(500),
        field: 'logo_url'
    },
    primaryColor: {
        type: DataTypes.STRING(7),
        defaultValue: '#2563EB',
        field: 'primary_color'
    },
    secondaryColor: {
        type: DataTypes.STRING(7),
        defaultValue: '#10B981',
        field: 'secondary_color'
    },
    accentColor: {
        type: DataTypes.STRING(7),
        defaultValue: '#1E293B',
        field: 'accent_color'
    },
    colors: {
        type: DataTypes.JSONB,
        defaultValue: ['#2563EB', '#10B981', '#1E293B']
    },
    fonts: {
        type: DataTypes.JSONB,
        defaultValue: null
    }
}, {
    tableName: 'brand_kits',
    underscored: true,
    timestamps: true
});

export default BrandKit;
