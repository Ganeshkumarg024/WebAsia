import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'first_name'
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'last_name'
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('client', 'designer', 'manager', 'admin', 'affiliate'),
        allowNull: false,
        defaultValue: 'client'
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active',
        allowNull: false
    },
    photoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'photo_url'
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    skills: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: []
    },
    portfolio: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    },
    socialLinks: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
        field: 'social_links'
    },
    oauthProvider: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'oauth_provider'
    },
    oauthId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'oauth_id'
    },
    refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'refresh_token'
    },
    resetPasswordToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'reset_password_token'
    },
    resetPasswordExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reset_password_expiry'
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'email_verified'
    },
    emailVerificationToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'email_verification_token'
    },
    emailVerificationExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'email_verification_expiry'
    },
    lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login_at'
    },
    managerId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'manager_id',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// Instance method to compare password
User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default User;
