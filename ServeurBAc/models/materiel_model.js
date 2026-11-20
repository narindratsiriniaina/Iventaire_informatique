module.exports = (sequelize, DataTypes) => {
  const Materiel = sequelize.define('Materiel', {
    code_mat: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero_serie: DataTypes.STRING(10),
    etat: DataTypes.STRING(32),
    marque: DataTypes.STRING(50),
    nom: DataTypes.STRING(100),
    modele: DataTypes.STRING(50),
    type_equipement: DataTypes.STRING(50),
    date_entree: DataTypes.DATEONLY,
    id_cate: {
      type: DataTypes.INTEGER,
      references: {
        model: 'categorie',
        key: 'id_cate'
      }
    },
    id_empl: {
      type: DataTypes.INTEGER,
      references: {
        model: 'emplacement',
        key: 'code_empl'
      }
    },
    code_detent: {
      type: DataTypes.INTEGER,
      references: {
        model: 'detenteur',
        key: 'code_detent'
      }
    },
    code_four: { 
      type: DataTypes.INTEGER,
      references: {
        model: 'fournisseur',
        key: 'code_four'
      }
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    tableName: 'materiel',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Materiel.associate = function(models) {
    Materiel.belongsTo(models.Categorie, { foreignKey: 'id_cate' });
    Materiel.belongsTo(models.Emplacement, { foreignKey: 'id_empl' });
    Materiel.belongsTo(models.Detenteur, { foreignKey: 'code_detent' });
    Materiel.belongsTo(models.Fournisseur, { foreignKey: 'code_four' });
    Materiel.belongsTo(models.Historique , {foreignKey:'code_mat'})
    Materiel.hasMany (models.Maintenance , {foreignKey: 'code_mat'})
  };

  return Materiel;
};