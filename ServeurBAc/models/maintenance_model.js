module.exports = (sequelize, DataTypes) => {
    const Maintenance = sequelize.define('Maintenance', {
        id_main: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        date_main: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        statut: {
            type: DataTypes.STRING(50)
        },
        type_main: {
            type: DataTypes.STRING(50)
        },
        code_mat: {
            type: DataTypes.INTEGER,
            references: {
                model: 'materiel',
                key: 'code_mat'
            }
        },
        description : {
                type : DataTypes.STRING
        },
        code_techn: {
            type: DataTypes.INTEGER,
            references: {
                model: 'technicien', 
                key: 'code_techn'
            },
            allowNull: true
        }
    }, {
        tableName: 'maintenances',
        timestamps: false
    });

    Maintenance.associate = function(models) {
        Maintenance.belongsTo(models.Materiel, { foreignKey: 'code_mat' });
        Maintenance.belongsTo(models.Technicien, { foreignKey: 'code_techn' });
    };

    return Maintenance;
};