const db = require('../models');
const { Op } = require('sequelize');
const { nombreAtttribue } = require('./Rapports.controller');

const CreatHistorique = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
        const { code_mat, ville, adresse_empl, nom_depart, nom_dir, district, region, type_dir, type_depart, code_detent, nom_det, prenom_det, fonction, num_im,num_porte} = req.body;

        // Vérifier l'existence du matériel
        const materielExistant = await db.materiel.findOne({
            where: { code_mat },
            include: [{ model: db.emplacement, as: 'Emplacement' }],
            transaction
        });

        if (!materielExistant) {
            await transaction.rollback();
            return res.status(404).json({ message: "Matériel non trouvé" });
        }

        // Vérifier l'existence du département
        const departementExistant = await db.departement.findOne({
            where: { nom_depart, ...(type_depart ? { type_depart } : {}) },
            transaction
        });

        if (!departementExistant) {
            await transaction.rollback();
            return res.status(404).json({ message: "Département non trouvé" });
        }

        // Vérifier la cohérence du type_depart
        if (type_depart && departementExistant.type_depart !== type_depart) {
            await transaction.rollback();
            return res.status(400).json({ message: "Le type de département ne correspond pas au département spécifié" });
        }

        const typeDepart = departementExistant.type_depart;

        // Gestion du détenteur
        let detenteurExistant = null;
        let finalCodeDetent = code_detent || null;

        if (!code_detent && nom_det && prenom_det) {
            // Créer un nouveau détenteur
            detenteurExistant = await db.detenteur.create({
                nom_det,
                prenom_det,
                fonction: fonction || null,
                num_im: num_im || null
            }, { transaction });
            finalCodeDetent = detenteurExistant.code_detent;
        } else if (code_detent) {
            // Vérifier l'existence du détenteur existant
            detenteurExistant = await db.detenteur.findOne({
                where: { code_detent },
                transaction
            });
            if (!detenteurExistant) {
                await transaction.rollback();
                return res.status(404).json({ message: "Détenteur non trouvé" });
            }
        }

        // Gestion spécifique pour DST
        let directionExistant = null;
        let directionId = null;
        if (typeDepart === "DST" && nom_dir && type_dir) {
            directionExistant = await db.direction.findOne({
                where: { 
                    nom_dir,
                    type_dir: type_dir || null
                },
                transaction
            });

            if (!directionExistant) {
                directionExistant = await db.direction.create({
                    nom_dir,
                    type_dir: type_dir || null
                }, { transaction });
            }
            directionId = directionExistant.id_dir;
        }

        // Vérifier ou créer l'emplacement de destination
        let emplacementDestExistant = await db.emplacement.findOne({
            where: { 
                [Op.and]: [
                    { ville },
                    { adresse_empl },
                    { distrinct: district || null },
                    { Region: region || null },
                    { id_depart: departementExistant.id_depart },
                    {num_porte : departementExistant.num_porte || null},
                    typeDepart === "DST" ? { id_dir: directionId || null } : {}
                ]
            },
            transaction
        });

        if (!emplacementDestExistant) {
            const emplacementData = {
                ville,
                adresse_empl,
                num_porte ,
                distrinct: district || null,
                Region: region || null,
                id_depart: departementExistant.id_depart,
                id_dir: directionId
            };

            emplacementDestExistant = await db.emplacement.create(emplacementData, { transaction });
        } else if (typeDepart === "DST" && emplacementDestExistant.id_dir !== directionId) {
            await db.emplacement.update(
                { id_dir: directionId },
                { where: { code_empl: emplacementDestExistant.code_empl }, transaction }
            );
        }

        // Vérifier la cohérence entre l'emplacement et le département
        if (emplacementDestExistant.id_depart !== departementExistant.id_depart) {
            await transaction.rollback();
            return res.status(400).json({ 
                message: "L'emplacement n'appartient pas au département spécifié",
                departement_emplacement: await db.departement.findByPk(emplacementDestExistant.id_depart)
            });
        }

        // Créer l'entrée dans l'historique
        const nouvelHistorique = await db.historique.create({  
            type_hist: "AFFECTATION",
            date_mouvement: new Date(),
            code_mat,
            id_empl_src: materielExistant.id_empl,
            id_empl_dest: emplacementDestExistant.code_empl
        }, { transaction });

        // Mettre à jour l'emplacement et le détenteur du matériel
        await db.materiel.update(
            { 
                id_empl: emplacementDestExistant.code_empl,
                code_detent: finalCodeDetent
            },
            { where: { code_mat }, transaction }
        );

        await transaction.commit();

        res.status(201).json({
            message: "Mouvement enregistré avec succès",
            details: {
                materiel: {
                    code: materielExistant.code_mat,
                    nom: materielExistant.nom,
                    ancien_emplacement: materielExistant.Emplacement,
                    code_detent: finalCodeDetent
                },
                nouvel_emplacement: emplacementDestExistant,
                departement: departementExistant,
                ...(directionExistant && { direction: directionExistant }),
                ...(detenteurExistant && { detenteur: detenteurExistant }),
                historique: nouvelHistorique
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Erreur lors du mouvement:", error);
        res.status(500).json({ 
            message: "Erreur lors du traitement du mouvement",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const getDetenteurs = async (req, res) => {
    try {
        const detenteurs = await db.detenteur.findAll({
            attributes: ['code_detent', 'nom_det', 'prenom_det'],
            limit: 100, // Limiter le nombre de résultats pour optimiser la performance
        });
        res.json({
            success: true,
            count: detenteurs.length,
            data: detenteurs
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des détenteurs:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};

const materielDisponible = async (req, res) => {
    try {
        const { type_depart, type_dir, attribue_only } = req.query; // Modifier pour accepter attribue_only comme query
        const whereClause = {
            id_empl: { [Op.not]: null },
        };
        if (attribue_only === 'true') {
            whereClause.code_detent = { [Op.not]: null };
        }
        const materiels = await db.materiel.findAll({
            include: [
                {
                    model: db.emplacement,
                    as: 'Emplacement',
                    attributes: ['code_empl', 'ville', 'adresse_empl', 'distrinct', 'Region', 'id_dir', 'id_depart'],
                    include: [
                        {
                            model: db.departement,
                            attributes: ['id_depart', 'nom_depart', 'type_depart'],
                            where: type_depart ? { type_depart } : {}
                        },
                        {
                            model: db.direction,
                            as: 'Direction',
                            attributes: ['id_dir', 'nom_dir', 'type_dir'],
                            required: false,
                            where: type_dir ? { type_dir } : {}
                        }
                    ]
                },
                {
                    model: db.detenteur,
                    attributes: ['code_detent', 'nom_det', 'prenom_det'],
                    required: attribue_only === 'true'
                }
            ],
            where: whereClause,
            attributes: ['code_mat', 'nom', 'numero_serie', 'etat', 'adresse_empl', 'Region', 'distrinct', 'type_depart'],
            limit: 100, // Limiter les résultats pour optimiser
        });

        const formattedMateriels = materiels.map(m => ({
            code_mat: m.code_mat,
            nom: m.nom,
            numero_serie: m.numero_serie,
            etat: m.etat,
            adresse_empl: m.Emplacement?.adresse_empl,
            Region: m.Emplacement?.Region,
            distrinct: m.Emplacement?.distrinct,
            type_depart: m.Emplacement?.Departement?.type_depart,
            nom_det: m.Detenteur?.nom_det,
            prenom_det: m.Detenteur?.prenom_det,
            emplacement: m.Emplacement ? {
                code_empl: m.Emplacement.code_empl,
                ville: m.Emplacement.ville,
                adresse_empl: m.Emplacement.adresse_empl,
                distrinct: m.Emplacement.distrinct,
                Region: m.Emplacement.Region,
                id_dir: m.Emplacement.id_dir,
                id_depart: m.Emplacement.id_depart,
                departement: m.Emplacement.Departement ? {
                    id_depart: m.Emplacement.Departement.id_depart,
                    nom_depart: m.Emplacement.Departement.nom_depart,
                    type_depart: m.Emplacement.Departement.type_depart
                } : null,
                direction: m.Emplacement.Direction ? {
                    id_dir: m.Emplacement.Direction.id_dir,
                    nom_dir: m.Emplacement.Direction.nom_dir,
                    type_dir: m.Emplacement.Direction.type_dir
                } : null
            } : null
        }));

        res.json({
            success: true,
            count: materiels.length,
            data: formattedMateriels
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des matériels disponibles:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};

const selectHist = async (req, res) => {
    try {
        const { date_entree,nom } = req.query;

        const whereClause = {};
        if (date_entree ) {
            whereClause.date_mouvement = {
                 date_entree
            };
        }
        const materialId ={}
        if (nom){
            materialId.nom = nom
        }

        const historiqueList = await db.historique.findAll({
            attributes: ['id_hist', 'type_hist', 'date_mouvement'],
            include: [
                {
                    model: db.materiel,

                    attributes: ['code_mat', 'nom', 'numero_serie']
                },
                {
                    model: db.emplacement,
                    as: 'EmplacementDestination',
                    attributes: ['distrinct', 'ville', 'Region', 'adresse_empl', 'id_dir', 'id_depart'],
                    include: [
                        {
                            model: db.departement,
                            attributes: ['id_depart', 'nom_depart', 'type_depart']
                        },
                        {
                            model: db.direction,
                            as: 'Direction',
                            attributes: ['id_dir', 'nom_dir', 'type_dir'],
                            required: false
                        }
                    ]
                },
                {
                    model: db.emplacement,
                    as: 'EmplacementSource',
                    attributes: ['Region', 'ville', 'distrinct', 'adresse_empl', 'id_dir', 'id_depart'],
                    include: [
                        {
                            model: db.departement,
                            attributes: ['id_depart', 'nom_depart', 'type_depart']
                        },
                        {
                            model: db.direction,
                            as: 'Direction',
                            attributes: ['id_dir', 'nom_dir', 'type_dir'],
                            required: false
                        }
                    ]
                }
            ],
            where: whereClause,
            order: [['date_mouvement', 'DESC']],
            limit: 100 // Limiter les résultats pour optimiser
        });

        const formattedHistorique = historiqueList.map(h => ({
            id_hist: h.id_hist,
            type_hist: h.type_hist,
            date_mouvement: h.date_mouvement,
            materiel: {
                code_mat: h.Materiel?.code_mat,
                nom: h.Materiel?.nom,
                numero_serie: h.Materiel?.numero_serie
            },
            emplacement_destination: {
                code_empl: h.EmplacementDestination?.code_empl,
                ville: h.EmplacementDestination?.ville,
                adresse_empl: h.EmplacementDestination?.adresse_empl,
                distrinct: h.EmplacementDestination?.distrinct,
                Region: h.EmplacementDestination?.Region,
                id_dir: h.EmplacementDestination?.id_dir,
                id_depart: h.EmplacementDestination?.id_depart,
                departement: {
                    id_depart: h.EmplacementDestination?.Departement?.id_depart,
                    nom_depart: h.EmplacementDestination?.Departement?.nom_depart,
                    type_depart: h.EmplacementDestination?.Departement?.type_depart
                },
                direction: h.EmplacementDestination?.Direction ? {
                    id_dir: h.EmplacementDestination?.Direction?.id_dir,
                    nom_dir: h.EmplacementDestination?.Direction?.nom_dir,
                    type_dir: h.EmplacementDestination?.Direction?.type_dir
                } : null
            },
            emplacement_source: {
                code_empl: h.EmplacementSource?.code_empl,
                ville: h.EmplacementSource?.ville,
                adresse_empl: h.EmplacementSource?.adresse_empl,
                distrinct: h.EmplacementSource?.distrinct,
                Region: h.EmplacementSource?.Region,
                id_dir: h.EmplacementSource?.id_dir,
                id_depart: h.EmplacementSource?.id_depart,
                departement: {
                    id_depart: h.EmplacementSource?.Departement?.id_depart,
                    nom_depart: h.EmplacementSource?.Departement?.nom_depart,
                    type_depart: h.EmplacementSource?.Departement?.type_depart
                },
                direction: h.EmplacementSource?.Direction ? {
                    id_dir: h.EmplacementSource?.Direction?.id_dir,
                    nom_dir: h.EmplacementSource?.Direction?.nom_dir,
                    type_dir: h.EmplacementSource?.Direction?.type_dir
                } : null
            }
        }));

        res.json({
            success: true,
            count: historiqueList.length,
            data: formattedHistorique
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'historique:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};

module.exports = {
    CreatHistorique,
    selectHist,
    materielDisponible,
    getDetenteurs,
    nombreAtttribue
};