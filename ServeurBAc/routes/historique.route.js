const historiqueRoutes  =require('../controllers/historique.controller')
const router = require('express').Router();

router.post('/historique', historiqueRoutes.CreatHistorique);  
router.get('/historique', historiqueRoutes.selectHist);
router.get('/historiques', historiqueRoutes.materielDisponible);
router.get('/Detenteur',historiqueRoutes.getDetenteurs)



module.exports = router;

