const db = require ('../models')

const departement = db.departement 

const affichage = async(req,res)=>{
    const chercher = await departement.findAll()
    return res.json(chercher);

}

module.exports  = {
    affichage
}