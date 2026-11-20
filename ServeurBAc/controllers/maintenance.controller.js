const { where, Op } = require('sequelize');
const db = require('../models');

const Maintenance = db.maintenance;
const Materiel = db.materiel;
const Technicien = db.technicien;
const Detenteur = db.detenteur;

const CreationMaintenance = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const {
            code_mat,
            description,
            date_main,
            type_main,
            statut,
            observation,
            cout,
            code_techn
        } = req.body;

        // Vérifier l'existence du matériel
        const materielExistant = await Materiel.findOne({
            where: { code_mat },
            transaction
        });

        if (!materielExistant) {
            await transaction.rollback();
            return res.status(404).json({ message: "Matériel non trouvé" });
        }

        // Vérifier l'existence du technicien (si fourni)
        let technicienExistant = null;
        if (code_techn) {
            technicienExistant = await Technicien.findOne({
                where: { code_techn },
                transaction
            });
            if (!technicienExistant) {
                await transaction.rollback();
                return res.status(404).json({ message: "Technicien non trouvé" });
            }
        }

        // Créer la maintenance
        const createMaintenance = await Maintenance.create({
            code_mat,
            description,
            date_main,
            type_main,
            statut,
            observation: observation || null,
            cout: cout || 0,
            code_techn: code_techn || null
        }, { transaction });

        await transaction.commit();
        res.status(201).json({
            message: "Maintenance enregistrée avec succès",
            details: {
                donnee: createMaintenance
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Erreur lors de la création de la maintenance:", error);
        res.status(500).json({
            message: "Erreur lors du traitement de la maintenance",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const UpdateMaintenance = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { id_main } = req.params;
        const {
            code_mat,
            description,
            date_main,
            type_main,
            statut,
            observation,
            cout,
            code_techn
        } = req.body;

        // Vérifier l'existence de la maintenance
        const maintenanceExistant = await Maintenance.findOne({
            where: { id_main },
            transaction
        });

        if (!maintenanceExistant) {
            await transaction.rollback();
            return res.status(404).json({ message: "Maintenance non trouvée" });
        }

        // Vérifier l'existence du matériel
        const materielExistant = await Materiel.findOne({
            where: { code_mat },
            transaction
        });

        if (!materielExistant) {
            await transaction.rollback();
            return res.status(404).json({ message: "Matériel non trouvé" });
        }

        // Vérifier l'existence du technicien (si fourni)
        let technicienExistant = null;
        if (code_techn) {
            technicienExistant = await Technicien.findOne({
                where: { code_techn },
                transaction
            });
            if (!technicienExistant) {
                await transaction.rollback();
                return res.status(404).json({ message: "Technicien non trouvé" });
            }
        }

        // Mettre à jour la maintenance
        await Maintenance.update({
            code_mat,
            description,
            date_main,
            type_main,
            statut,
            observation: observation || null,
            cout: cout || 0,
            code_techn: code_techn || null
        }, {
            where: { id_main },
            transaction
        });

        // Mettre à jour l'état du matériel si la maintenance est terminée
        if (statut === 'terminee') {
            await Materiel.update(
                { etat: 'en service' },
                { where: { code_mat }, transaction }
            );
        } else if (statut == "en_cours"){
            await Materiel.update(
                { etat: 'en reparation' },
                {where: { code_mat }, transaction }
            )
        }

        await transaction.commit();
        res.status(200).json({
            message: "Maintenance mise à jour avec succès"
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Erreur lors de la mise à jour de la maintenance:", error);
        res.status(500).json({
            message: "Erreur lors du traitement de la maintenance",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const GetMaintenances = async (req, res) => {
    try {
        const { search, type_main, statut } = req.query;
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { description: { [Op.like]: `%${search}%` } },
                { '$Materiel.nom$': { [Op.like]: `%${search}%` } },
                { '$Materiel.numero_serie$': { [Op.like]: `%${search}%` } },
                { '$Technicien.nom_techn$': { [Op.like]: `%${search}%` } },
                { '$Technicien.prenom_techn$': { [Op.like]: `%${search}%` } }
            ];
        }

        if (type_main) {
            whereClause.type_main = type_main;
        }

        if (statut) {
            whereClause.statut = statut;
        }

        const maintenances = await Maintenance.findAll({
            where: whereClause,
            include: [
                {
                    model: Materiel,
                    as: 'Materiel',
                    attributes: ['code_mat', 'nom', 'numero_serie']
                },
                {
                    model: Technicien,
                    as: 'Technicien',
                    attributes: ['code_techn', 'nom_techn', 'prenom_techn'],
                    required: false
                }
            ]
        });

        const formattedMaintenances = maintenances.map(m => ({
            id_main: m.id_main,
            code_mat: m.code_mat,
            nom_materiel: m.Materiel?.nom || 'Non spécifié',
            numero_serie: m.Materiel?.numero_serie || 'Non spécifié',
            description: m.description,
            type_main: m.type_main,
            statut: m.statut,
            date_main: m.date_main,
            nom_tech: m.Technicien ? `${m.Technicien.nom_techn} ${m.Technicien.prenom_techn}` : 'Non attribué',
            observation: m.observation,
            cout: m.cout || 0
        }));

        res.json({
            success: true,
            count: maintenances.length,
            data: formattedMaintenances
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des maintenances:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};

const GetTechniciens = async (req, res) => {
    try {
        const techniciens = await Technicien.findAll({
            attributes: ['code_techn', 'nom_techn', 'prenom_techn']
        });

        res.json({
            success: true,
            count: techniciens.length,
            data: techniciens
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des techniciens:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};

const UpdateMaterielEtat = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { code_mat } = req.params;
        const { etat } = req.body;

        const materielExistant = await Materiel.findOne({
            where: { code_mat },
            transaction
        });

        if (!materielExistant) {
            await transaction.rollback();
            return res.status(404).json({ message: "Matériel non trouvé" });
        }

        await Materiel.update(
            { etat },
            { where: { code_mat }, transaction }
        );

        await transaction.commit();
        res.status(200).json({
            message: "État du matériel mis à jour avec succès"
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Erreur lors de la mise à jour de l'état du matériel:", error);
        res.status(500).json({
            message: "Erreur lors du traitement",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const GetMateriels = async (req, res) => {
    try {
        const { search, categorie, nom_dete, attribue_only } = req.query;
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { nom: { [Op.like]: `%${search}%` } },
                { numero_serie: { [Op.like]: `%${search}%` } }
            ];
        }

        if (categorie) {
            whereClause.id_cate = categorie;
        }

        if (nom_dete) {
            whereClause['$Detenteur.nom_det$'] = { [Op.like]: `%${nom_dete}%` };
        }

        if (attribue_only === 'true') {
            whereClause.code_detent = { [Op.ne]: null };
        }

        const materiels = await Materiel.findAll({
            where: whereClause,
            include: [
                {
                    model: db.categorie,
                    attributes: ['id_cate', 'nom_cate']
                },
                {
                    model: db.emplacement,
                    attributes: ['ville', 'adresse_empl'],
                    include: [{ model: db.departement, attributes: ['nom_depart'] }]
                },
                {
                    model: Detenteur,
                    attributes: ['nom_det', 'prenom_det'],
                    required: nom_dete || attribue_only === 'true'
                }
            ]
        });

        const formattedMateriels = materiels.map(m => ({
            code_mat: m.code_mat,
            nom: m.nom,
            numero_serie: m.numero_serie,
            categorie: m.Categorie?.nom_cate || 'Non spécifié',
            etat: m.etat,
            ville: m.Emplacement?.ville || 'Non spécifié',
            adresse_empl: m.Emplacement?.adresse_empl || 'Non spécifié',
            nom_depart: m.Emplacement?.Departement?.nom_depart || 'Non spécifié',
            nom_dete: m.Detenteur?.nom_det,
            prenom_dete: m.Detenteur?.prenom_det
        }));

        res.json({
            success: true,
            count: materiels.length,
            data: formattedMateriels
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des matériels:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};

const GetCategories = async (req, res) => {
    try {
        const categories = await db.categorie.findAll({
            attributes: ['id_cate', 'nom_cate']
        });

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};

module.exports = {
    CreationMaintenance,
    UpdateMaintenance,
    GetMaintenances,
    GetTechniciens,
    UpdateMaterielEtat,
    GetMateriels,
    GetCategories
};