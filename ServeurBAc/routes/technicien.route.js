const express = require('express');
const router = express.Router();
const technicienController = require('../controllers/technicien.controller');

// Routes pour les techniciens
router.get('/', technicienController.getAllTechniciens);
router.get('/:id', technicienController.getTechnicienById);
router.post('/', technicienController.createTechnicien);
router.put('/:id', technicienController.updateTechnicien);
router.delete('/:id', technicienController.deleteTechnicien);

module.exports = router;