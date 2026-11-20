const db = require('../models');
const { Op } = require('sequelize');

const afficher = async (req, res) => {
    const historique = await db.historique.findAll({
        where: {
          date_mouvement: {
            [Op.between]: [new Date(date_debut), new Date(date_fin)]
          }
        },
        include: [
          {
            model: db.materiel,
            attributes: ['code_mat', 'nom', 'numero_serie']
          },
          {
            model: db.emplacement,
            as: 'SourceEmplacement',
            attributes: ['ville', 'adresse_empl'],
            include: {
              model: db.departement,
              attributes: ['nom_depart']
            }
          },
          {
            model: db.emplacement,
            as: 'DestinationEmplacement', 
            attributes: ['ville', 'adresse_empl'],
            include: {
              model: db.departement,
              attributes: ['nom_depart']
            }
          }
        ],
        order: [['date_mouvement', 'DESC']]
      });


    res.json({
        success: true,
        count: historique.length,
        data: historique });


      
    
};

module.exports = {
    afficher
};