const afficher = require('../controllers/emplacement.controller');

const router = require('express').Router();

router.get('/emplacement', afficher.AffichagedeEmplacement);

module.exports = router;