module.exports = (sequelize, DataTypes) => {
    const Fournisseur = sequelize.define('Fournisseur', {
      code_four: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nom_four: DataTypes.STRING(100),
      contact_four: DataTypes.STRING(20),
      adresse_four: DataTypes.STRING(50)
    }, {
      tableName: 'fournisseur',
      timestamps: false
    });
  
    Fournisseur.associate = function(models) {
      Fournisseur.hasMany(models.Materiel, { foreignKey: 'code_four' });
    };
  
    return Fournisseur;
  };