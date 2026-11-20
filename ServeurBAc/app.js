const express = require('express');
const cors = require('cors');
const db = require('./models/index');
require('dotenv').config();
const app = express();

const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
};


app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import des routes
const categorie = require('./routes/categorie.route');
const materiel = require('./routes/materiel.route.js');
const depart = require ('./routes/departement.route.js')
const historique = require('./routes/historique.route.js');
const affectations = require('./routes/affecter.route.js');
const maintenance = require ('./routes/maintenance.route.js')
const technicien = require ('./routes/technicien.route.js')
const Rapport = require ('./routes/Rapport.route.js');
const login = require ('./routes/auth.route.js')
const emplacement = require ('./routes/emplacement.route.js')
// Utilisation des routes


app.use('/maintenance',maintenance);
app.use('/', categorie);
app.use('/', materiel);
app.use ('/', depart)
app.use('/', historique);
app.use('/', affectations);
app.use ('/technicien', technicien)
app.use ('/',Rapport);
app.use('/', login);
app.use('/', emplacement);

// Route de base pour tester l'API
app.get('/', (req, res) => {
  res.json({ message: 'API BACKEND' });
});
// Middleware pour gérer les erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur', error: err.message });
});

const Port = 3000;

app.listen(Port, () => {
  console.log("App listening on http://localhost:" + Port);
});