module.exports = (sequelize, DataTypes) => {
    const Historique= sequelize.define('Historique', {
      id_hist: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },


      type_hist: DataTypes.STRING(50),
      date_mouvement: DataTypes.DATEONLY,
      code_mat: {
        type: DataTypes.INTEGER,
        references: {
          model: 'materiel',
          key: 'code_mat'
        }
      },


      id_empl_src: {
        type: DataTypes.INTEGER,
        references: {
          model: 'emplacement',
          key: 'code_empl'
        },
        allowNull: true 
      },


      id_empl_dest: {
        type: DataTypes.INTEGER,
        references: {
          model: 'emplacement',
          key: 'code_empl'
        },
        allowNull: true 
      }


    }, {
      tableName: 'historique',
      timestamps: false 
    });

  
    Historique.associate = function(models) {
      Historique.belongsTo(models.Materiel, { foreignKey: 'code_mat' });
      Historique.belongsTo(models.Emplacement, { foreignKey: 'id_empl_src', as: 'SourceEmplacement' });
      Historique.belongsTo(models.Emplacement, { foreignKey: 'id_empl_dest', as: 'DestinationEmplacement' });
    };
  
    return Historique;
  };