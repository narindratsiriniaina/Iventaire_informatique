const departement = require ('../controllers/departement.controller')

const router = require ('express').Router() ;


router.get('/departements' , departement.affichage)

module.exports = router