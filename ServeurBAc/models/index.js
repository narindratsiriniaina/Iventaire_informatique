require('dotenv').config();
const dbconfig = require('../config/dbconfig.js');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  dbconfig.DATABASE,
  dbconfig.USER,
  dbconfig.PASSWORD, {
    host: dbconfig.HOST,
    dialect: dbconfig.DIALECT,
    operatorsAliases: false,
    pool: {
      max: dbconfig.pool.max,
      min: dbconfig.pool.min,
      acquire: dbconfig.pool.acquire,
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('Connecté avec succès à la base de données via WampServer');
  })
  .catch(err => {
    console.error('Erreur de connexion:', err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.categorie = require('./categorie_model.js')(sequelize, DataTypes);
db.emplacement = require('./emplacement_model.js')(sequelize, DataTypes);
db.detenteur = require('./detenteur_model.js')(sequelize, DataTypes);
db.materiel = require('./materiel_model.js')(sequelize, DataTypes);
db.direction = require('./direction_model.js')(sequelize, DataTypes);
db.fournisseur = require('./fournisseur_model.js')(sequelize, DataTypes);
db.departement = require('./departement_model.js')(sequelize, DataTypes);
db.historique = require('./historique_model.js')(sequelize, DataTypes);
db.maintenance = require('./maintenance_model.js')(sequelize, DataTypes);
db.technicien = require('./technicien_model.js')(sequelize, DataTypes);
db.user = require('./utilisateur_model.js')(sequelize, DataTypes);

require('./association.js')(db);

db.sequelize.sync({ force: false })
  .then(() => {
    console.log('Base de données synchronisée avec succès');
  })
  .catch(err => {
    console.error('Erreur de synchronisation:', err);
  });

module.exports = db;