const express = require('express');
const router = express.Router();
const materielController = require('../controllers/materiel.controller');


router.post('/materiels', materielController.Ajouter);

router.get('/materiels', materielController.recherche);


router.put('/materiels/:id', materielController.modifier);

router.get('/materiels/:id',materielController.getById);

router.delete('/materiels/:id', materielController.supprimer);

module.exports = router;