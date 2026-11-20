const categoriesRoute = require ('../controllers/categorie.controller.js')


const router = require('express').Router();

router.post('/',categoriesRoute.createCategorie);
router.get ('/categories',categoriesRoute.trouver) ;


module.exports = router