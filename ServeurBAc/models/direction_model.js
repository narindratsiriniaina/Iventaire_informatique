module.exports = (sequelize, DataTypes) => {
  const Direction = sequelize.define('Direction', {
    id_dir: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nom_dir: DataTypes.STRING,
    type_dir: DataTypes.STRING,
  }, {
    tableName: 'direction',
    timestamps: false
  });
  Direction.associate = function(models) {
    Direction.hasMany(models.Emplacement,{
        foreignKey : "id_dir",
        as : "Emplacement"
    })
};

  return Direction;
};