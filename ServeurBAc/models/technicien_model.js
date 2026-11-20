module.exports = (sequelize, DataTypes) => {
    const Technicien = sequelize.define('Technicien', {
        code_techn: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom_techn: {
            type: DataTypes.STRING(256)
        },
        prenom_techn: {
            type: DataTypes.STRING(256)
        },
        contact_techn: {
            type: DataTypes.STRING(10)
        },
        adresse_techn: {
            type: DataTypes.STRING(100)
        }
    }, {
        tableName: 'technicien', 
        timestamps: false
    });

    Technicien.associate = function(models) {
        Technicien.hasMany(models.Maintenance, { foreignKey: 'code_techn' });
    };

    return Technicien;
};