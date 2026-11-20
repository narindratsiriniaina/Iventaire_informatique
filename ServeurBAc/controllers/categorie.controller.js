const db = require ('../models')

const Categorie = db.categorie 

const createCategorie = async (req ,res) =>{
  let categoriesa ={
    nom_cate : req.body.nom_cate ,
    type : req.body.type
  }
  const categorie = await Categorie.create(
  categoriesa )
  res.status(201).json(categorie);
}
  

const trouver = async (req , res) => {
  const query  = await Categorie.findAll();
  res.status(200).send(query)
}






module.exports ={createCategorie , trouver}