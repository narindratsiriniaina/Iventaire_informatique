const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');

router.post('/maintenances', maintenanceController.CreationMaintenance);
router.put('/maintenances/:id_main', maintenanceController.UpdateMaintenance);
router.get('/maintenances', maintenanceController.GetMaintenances);
router.get('/techniciens', maintenanceController.GetTechniciens);
router.put('/materiels/:code_mat/etat', maintenanceController.UpdateMaterielEtat);
router.get('/materiels', maintenanceController.GetMateriels);
router.get('/categories', maintenanceController.GetCategories);

module.exports = router;