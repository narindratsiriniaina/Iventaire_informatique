module.exports = (sequelize,DataTypes) =>{
    const Historique = sequelize.define('Historique', {
        id_hist : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        type_hist : {
            type :  DataTypes.STRING(10),
        },

        date_hist : {
            type : DataTypes.DATE
        },

        code_mat  : {
            type : DataTypes.INTEGER ,
            references : {
                model : 'materiel',
                key : 'code_mat'
            }
        },
    });
    Historique.associate = function(models) {
        Historique.belongsTo(models.Materiel, { foreignKey: 'code_mat' });
    }
    return Historique ;
}