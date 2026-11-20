module.exports = (sequelize, DataTypes) => {
  const Departement = sequelize.define('Departement', {
    id_depart: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    nom_depart: DataTypes.STRING(100),
    type_depart: DataTypes.STRING(50)
  }, {
    tableName: 'departement',
    timestamps: false
  });

  Departement.associate = function(models) {
    Departement.hasMany(models.Emplacement, { 
      foreignKey: 'id_depart' 
    });
  };

  return Departement;
};