module.exports = (sequelize, DataTypes) => {
  
    const Emplacement = sequelize.define('Emplacement', {
      code_empl: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ville: DataTypes.STRING(50),
      adresse_empl: DataTypes.STRING(100),
      distrinct : DataTypes.STRING(100),
      Region : DataTypes.STRING(100),
      id_depart: DataTypes.INTEGER,
      num_porte : DataTypes.INTEGER,
      id_dir : {
          type: DataTypes.INTEGER ,
          references : {
              model : 'direction',
              key : 'id_dir'
          }
      }
    },
     {
      tableName: 'emplacement',
      timestamps: false
    });
  
    Emplacement.associate = function(models) {
      Emplacement.belongsTo(models.Departement, { foreignKey: 'id_depart' });
      Emplacement.hasMany(models.Materiel, { foreignKey: 'id_empl' });
      Emplacement.hasMany(models.Historique, { foreignKey: 'id_empl_source', as: 'SourceEmplacement' });
      Emplacement.hasMany(models.Historique, { foreignKey: 'id_empl_destination', as: 'DestinationEmplacement' });
      Emplacement.belongsTo ( models.Direction  ,{foreignKey : "id_dir" , as : 'Direction'})
    };
  
    return Emplacement;
  };