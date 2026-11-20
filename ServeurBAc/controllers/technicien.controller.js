const db = require('../models');
const { Op } = require('sequelize');

const Technicien = db.technicien ;
const Maintenance = db.maintenance;


// Récupérer tous les techniciens
const getAllTechniciens = async (req, res) => {
    try {
        const techniciens = await Technicien.findAll({
            attributes: ['code_techn', 'nom_techn', 'prenom_techn', 'contact_techn', 'adresse_techn']
        });
        res.status(200).json({ data: techniciens });
    } catch (error) {
        console.error('Erreur lors de la récupération des techniciens:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des techniciens' });
    }
};

// Récupérer un technicien par ID
const getTechnicienById = async (req, res) => {
    try {
        const technicien = await Technicien.findByPk(req.params.id, {
            attributes: ['code_techn', 'nom_techn', 'prenom_techn', 'contact_techn', 'adresse_techn']
        });
        if (!technicien) {
            return res.status(404).json({ message: 'Technicien non trouvé' });
        }
        res.status(200).json(technicien);
    } catch (error) {
        console.error('Erreur lors de la récupération du technicien:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération du technicien' });
    }
};

// Créer un nouveau technicien
const createTechnicien = async (req, res) => {
    try {
        const { nom_techn, prenom_techn, contact_techn, adresse_techn } = req.body;

        // Validation des champs requis
        if (!nom_techn || !prenom_techn || !contact_techn) {
            return res.status(400).json({ message: 'Nom, prénom et contact sont requis' });
        }

        // Vérifier si le contact existe déjà
        const existingTechnicien = await Technicien.findOne({ where: { contact_techn } });
        if (existingTechnicien) {
            return res.status(409).json({ message: 'Un technicien avec ce contact existe déjà' });
        }

        const technicien = await Technicien.create({
            nom_techn,
            prenom_techn,
            contact_techn,
            adresse_techn: adresse_techn || null
        });
        res.status(201).json(technicien);
    } catch (error) {
        console.error('Erreur lors de la création du technicien:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la création du technicien' });
    }
};

// Mettre à jour un technicien
const updateTechnicien = async (req, res) => {
    try {
        const { nom_techn, prenom_techn, contact_techn, adresse_techn } = req.body;

        // Validation des champs
        if (!nom_techn || !prenom_techn || !contact_techn) {
            return res.status(400).json({ message: 'Nom, prénom et contact sont requis' });
        }

        const technicien = await Technicien.findByPk(req.params.id);
        if (!technicien) {
            return res.status(404).json({ message: 'Technicien non trouvé' });
        }

        // Vérifier si le contact est déjà utilisé par un autre technicien
        const existingTechnicien = await Technicien.findOne({
            where: { contact_techn, code_techn: { [Op.ne]: req.params.id } }
        });
        if (existingTechnicien) {
            return res.status(409).json({ message: 'Un autre technicien avec ce contact existe déjà' });
        }

        await technicien.update({
            nom_techn,
            prenom_techn,
            contact_techn,
            adresse_techn: adresse_techn || null
        });
        res.status(200).json(technicien);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du technicien:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du technicien' });
    }
};

// Supprimer un technicien
const deleteTechnicien = async (req, res) => {
    try {
        const technicien = await Technicien.findByPk(req.params.id);
        if (!technicien) {
            return res.status(404).json({ message: 'Technicien non trouvé' });
        }

        // Vérifier si le technicien est associé à des maintenances
        const maintenances = await Maintenance.findAll({ where: { code_techn: req.params.id } });
        if (maintenances.length > 0) {
            return res.status(400).json({ message: 'Impossible de supprimer : le technicien est associé à des maintenances' });
        }

        await technicien.destroy();
        res.status(200).json({ message: 'Technicien supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du technicien:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression du technicien' });
    }
};

module.exports = {
    getAllTechniciens,
    getTechnicienById,
    createTechnicien,
    updateTechnicien,
    deleteTechnicien
};