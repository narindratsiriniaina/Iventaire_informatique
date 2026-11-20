// routes/emplacement.js
const express = require('express');

const db = require('../models');

const AffichagedeEmplacement = async (req,res)=>{
    try {
        const emplacements = await db.emplacement.findAll({
          include: [
            { model: db.departement, attributes: ['id_depart', 'nom_depart', 'type_depart'] },
            { model: db.direction, attributes: ['id_dir', 'nom_dir', 'type_dir'] }
          ]
        })
        res.json(emplacements)
      } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
      }
}

module.exports = {
    AffichagedeEmplacement
}