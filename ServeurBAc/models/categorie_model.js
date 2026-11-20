module.exports = (sequelize, DataTypes) => {
    const Categorie = sequelize.define('Categorie', {
      id_cate: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nom_cate: DataTypes.STRING(32) ,
      type : DataTypes.STRING(32) 
    }, {
      tableName: 'categorie',
      timestamps: false
    });
    Categorie.associate = (models) => {
      Categorie.hasMany(models.Materiel, {
        foreignKey: 'id_cate', 
        sourceKey: 'id_cate'  
      });
    };
  
    return Categorie;
  };