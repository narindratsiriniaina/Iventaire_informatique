module.exports = (sequelize, DataTypes) => {
    const Detenteur = sequelize.define('Detenteur', {
      code_detent: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nom_det: DataTypes.STRING(100),
      prenom_det: DataTypes.STRING(100),
      num_im: DataTypes.INTEGER,
      fonction: DataTypes.STRING(50)
    }, {
      tableName: 'detenteur',
      timestamps: false
    });
  
    Detenteur.associate = function(models) {
      Detenteur.hasMany(models.Materiel, { foreignKey: 'code_detent' });
    };
  
    return Detenteur;
  };