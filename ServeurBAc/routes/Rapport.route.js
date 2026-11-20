const rapportroute = require( '../controllers/Rapports.controller')
const router = require('express').Router();

router.get('/rapports', rapportroute.getAllRapports);
router.get('/mat',rapportroute.getMateriel);
router.get('/nombrePanne', rapportroute.nombrePanne);
router.get('/nombreMateriel',rapportroute.nombreMat);
router.get ('/listeAffecter',rapportroute.affichageAffect);
router.get ('/listeMain',rapportroute.affichageMain);
router.get('/listeMateriel',rapportroute.matPanne);
router.get('/listeCours',rapportroute.affihcgeEnCours);
router.get('/nbrCours',rapportroute.nombreMaintenance);
router.get('/attribueMateriel',rapportroute.nombreAtttribue);
router.get('/listeNonAttribue',rapportroute.afficherMaterieNonAttribue)
router.get('/activiteMensuelle', rapportroute.activiteMensuelle);
module.exports = router;
