module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        id_use: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom_user: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type_user: {
            type: DataTypes.ENUM('admin', 'user', 'editeur'),
            allowNull: false,
            defaultValue: 'user'
        },
        avatar: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'users',
        timestamps: true
    });

    return User;
};