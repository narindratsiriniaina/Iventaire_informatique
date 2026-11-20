const afficher = require('../controllers/affectation.controller');

const router = require('express').Router();

router.get('/affecter', afficher.afficher);

module.exports = router;