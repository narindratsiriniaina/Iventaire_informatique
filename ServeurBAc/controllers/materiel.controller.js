const { where, Op } = require('sequelize');
const db = require('../models');

// Déclarer les modèles avec des noms clairs
const Materiel = db.materiel;
const Categorie = db.categorie;
const Direction = db.direction;
const Emplacement = db.emplacement;
const Departement = db.departement;
const Detenteur = db.detenteur;
const Fournisseur = db.fournisseur;

const Ajouter = async (req, res) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();

        const {
            numero_serie,
            nom_equi,
            modele,
            etat,
            type_equi,
            marque,
            date_utilisation,
            id_categorie,
            num_porte,
            num_depa,
            type_dir,
            nom_dir,
            ville,
            adresse_empl,
            Region,
            distrinct,
            attribue,
            nom_det,
            prenom_det,
            num_im,
            fonction,
            nom_four,
            contact_four,
            adresse_four
        } = req.body;

        // 1. Vérifier le type de département
        const departement = await Departement.findOne({
            where: { id_depart: num_depa },
            transaction
        });
        
        if (!departement) {
            throw new Error('Département introuvable');
        }
        const typeDepart = departement.type_depart;

        // 2. Insérer le fournisseur si fourni
        let nouveauFournisseur = null;
        if (nom_four) {
            nouveauFournisseur = await Fournisseur.create({
                nom_four,
                contact_four,
                adresse_four
            }, { transaction });
        }

        // 3. Insérer le détenteur si nécessaire
        let nouveauDetenteur = null;
        if (attribue && nom_det && prenom_det) {
            nouveauDetenteur = await Detenteur.create({
                nom_det,
                prenom_det,
                num_im,
                fonction
            }, { transaction });
        }

        // 4. Insérer la direction si le département est de type DST
        let nouvelleDirection = null;
        if (typeDepart === "DST" && nom_dir) {
            nouvelleDirection = await Direction.findOne({
                where: {
                    nom_dir,
                    type_dir: type_dir || null
                },
                transaction
            });
            if (!nouvelleDirection) {
                nouvelleDirection = await Direction.create({
                    nom_dir,
                    type_dir: type_dir || null
                }, { transaction });
            }
        }

        // 5. Insérer l'emplacement
        let nouvelEmplacement = null;
        if (num_depa) {
            nouvelEmplacement = await Emplacement.create({
                ville,
                adresse_empl,
                distrinct,
                Region,
                num_porte,
                id_dir: nouvelleDirection ? nouvelleDirection.id_dir : null,
                id_depart: num_depa
            }, { transaction });
        }

        // 6. Insérer le matériel
        const nouveauMateriel = await Materiel.create({
            numero_serie,
            nom: nom_equi,
            modele,
            etat,
            type_equipement: type_equi,
            marque,
            date_entree: date_utilisation,
            id_cate: id_categorie,
            id_empl: nouvelEmplacement ? nouvelEmplacement.code_empl : null,
            code_detent: nouveauDetenteur ? nouveauDetenteur.code_detent : null,
            code_four: nouveauFournisseur ? nouveauFournisseur.code_four : null
        }, { transaction });

        await transaction.commit();
        
        res.json({ 
            success: true,
            materialId: nouveauMateriel.code_mat,
            message: 'Matériel ajouté avec succès'
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Erreur:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Erreur serveur'
        });
    }
};

const recherche = async (req, res) => {
    try {
        const { type_depart, type_dir, adresse, search, nom_dete, num_im, attribue_only, region, distrinct, date_entree,etat,num_porte} = req.query;

        let whereClause = {};
        let emplacementWhere = {};
        let detenteurWhere = {};

        // Construire dynamiquement la clause where pour Emplacement
        if (adresse) {
            emplacementWhere.adresse_empl = { [Op.like]: `%${adresse}%` };
        }
        if (region) {
            emplacementWhere.Region = { [Op.like]: `%${region}%` };
        }
        if (distrinct) {
            emplacementWhere.distrinct = { [Op.like]: `%${distrinct}%` };
        }
        if (num_porte) {
            emplacementWhere.num_porte = {[Op.like] : `%${num_porte}`}
        }

        if (nom_dete) {
            detenteurWhere.nom_det = { [Op.like]: `%${nom_dete}%` };
        }
        if (num_im) {
            detenteurWhere.num_im = { [Op.like]: `%${num_im}%` };
        }

        let include = [
            {
                model: Emplacement,
                required: !!type_depart || !!adresse || !!region || !!distrinct || !!num_porte,
                attributes: ['code_empl', 'ville', 'adresse_empl', 'distrinct', 'Region', 'id_dir', 'id_depart','num_porte'],
                include: [
                    {
                        model: Departement,
                        required: !!type_depart,
                        where: type_depart ? { type_depart } : {},
                    },
                    {
                        model: Direction,
                        as: 'Direction',
                        attributes: ['id_dir', 'nom_dir', 'type_dir'],
                        required: !!type_dir,
                        where: type_dir ? { type_dir } : {},
                    },
                ],
                where: Object.keys(emplacementWhere).length > 0 ? emplacementWhere : undefined,
            },
            {
                model: Detenteur,
                required: false,
                where: Object.keys(detenteurWhere).length > 0 ? detenteurWhere : undefined,
            },
            {
                model: Categorie,
                required: false,
            },
        ];

        // Filtre matériels attribués
        if (attribue_only === 'true') {
            whereClause.code_detent = { [Op.ne]: null };
        }

        if (date_entree) {
            whereClause.date_entree = date_entree;
        }

        // Recherche globale
        if (search) {
            whereClause[Op.or] = [
                { nom: { [Op.like]: `%${search}%` } },
                { numero_serie: { [Op.like]: `%${search}%` } },
                { marque: { [Op.like]: `%${search}%` } },
                { modele: { [Op.like]: `%${search}%` } },
            ];
        }
        if (etat){
            whereClause.etat = { [Op.like]: `%${etat}%` };
        }

        const materiels = await Materiel.findAll({
            where: whereClause,
            include: include,
            order: [['nom', 'ASC']],
            subQuery: false,
        });

        // Formater les résultats pour le frontend
        const results = materiels.map((m) => ({
            code_mat: m.code_mat,
            numero_serie: m.numero_serie,
            nom: m.nom,
            modele: m.modele,
            etat: m.etat,
            type_equipement: m.type_equipement,
            marque: m.marque,
            num_porte : m.num_porte,
            date_entree: m.date_entree,
            nom_cate: m.Categorie?.nom_cate,
            id_cate: m.id_cate,
            type_depart: m.Emplacement?.Departement?.type_depart,
            nom_depart: m.Emplacement?.Departement?.nom_depart,
            id_depart: m.Emplacement?.id_depart,
            ville: m.Emplacement?.ville,
            num_porte : m.Emplacement?.num_porte,
            adresse_empl: m.Emplacement?.adresse_empl,
            distrinct: m.Emplacement?.distrinct,
            Region: m.Emplacement?.Region,
            type_dir: m.Emplacement?.Direction?.type_dir,
            nom_dir: m.Emplacement?.Direction?.nom_dir,
            nom_det: m.Detenteur?.nom_det,
            prenom_det: m.Detenteur?.prenom_det,
            num_im: m.Detenteur?.num_im,
            fonction: m.Detenteur?.fonction,
            nom_four: m.Fournisseur?.nom_four,
            contact_four: m.Fournisseur?.contact_four,
            adresse_four: m.Fournisseur?.adresse_four,
            est_attribue: m.code_detent ? 1 : 0,
        }));

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const getById = async (req, res) => {
    try {
        const materialId = req.params.id;

        const materiel = await Materiel.findByPk(materialId, {
            include: [
                {
                    model: Emplacement,
                    attributes: ['code_empl', 'ville', 'adresse_empl', 'distrinct', 'Region', 'id_dir', 'id_depart','num_porte'],
                    include: [
                        {
                            model: Departement,
                            attributes: ['id_depart', 'nom_depart', 'type_depart'],
                        },
                        {
                            model: Direction,
                            as: 'Direction',
                            attributes: ['id_dir', 'nom_dir', 'type_dir'],
                        },
                    ],
                },
                {
                    model: Categorie,
                    attributes: ['id_cate', 'nom_cate'],
                },
                {
                    model: Detenteur,
                    attributes: ['code_detent', 'nom_det', 'prenom_det', 'num_im', 'fonction'],
                },
                {
                    model: Fournisseur,
                    attributes: ['code_four', 'nom_four', 'contact_four', 'adresse_four'],
                },
            ],
        });

        if (!materiel) {
            return res.status(404).json({ error: 'Matériel introuvable' });
        }

        // Formater les données pour correspondre au format du frontend
        const result = {
            code_mat: materiel.code_mat,
            numero_serie: materiel.numero_serie,
            nom: materiel.nom,
            modele: materiel.modele,
            etat: materiel.etat,
            type_equipement: materiel.type_equipement,
            marque: materiel.marque,
            date_entree: materiel.date_entree,
            id_cate: materiel.id_cate,
            nom_cate: materiel.Categorie?.nom_cate,
            id_depart: materiel.Emplacement?.id_depart,
            type_depart: materiel.Emplacement?.Departement?.type_depart,
            nom_depart: materiel.Emplacement?.Departement?.nom_depart,
            ville: materiel.Emplacement?.ville,
            num_porte  : materiel.Emplacement?.num_porte ,
            adresse_empl: materiel.Emplacement?.adresse_empl,
            distrinct: materiel.Emplacement?.distrinct,
            Region: materiel.Emplacement?.Region,
            type_dir: materiel.Emplacement?.Direction?.type_dir,
            nom_dir: materiel.Emplacement?.Direction?.nom_dir,
            nom_det: materiel.Detenteur?.nom_det,
            prenom_det: materiel.Detenteur?.prenom_det,
            num_im: materiel.Detenteur?.num_im,
            fonction: materiel.Detenteur?.fonction,
            nom_four: materiel.Fournisseur?.nom_four,
            contact_four: materiel.Fournisseur?.contact_four,
            adresse_four: materiel.Fournisseur?.adresse_four,
            est_attribue: materiel.code_detent ? 1 : 0,
        };

        res.json(result);
    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const modifier = async (req, res) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();

        const materialId = req.params.id;
        const {
            numero_serie,
            nom_equi,
            modele,
            etat,
            type_equi,
            marque,
            date_utilisation,
            id_categorie,
            num_depa,
            type_dir,
            nom_dir,
            ville,
            Region,
            distrinct,
            adresse_empl,
            attribue,
            nom_det,
            prenom_det,
            num_im,
            fonction,
            nom_four,
            contact_four,
            adresse_four,
            num_porte,
        } = req.body;

        // 1. Récupérer le matériel existant
        const currentMaterial = await Materiel.findByPk(materialId, { transaction });
        
        if (!currentMaterial) {
            return res.status(404).json({ error: "Matériel introuvable" });
        }

        // 2. Vérifier le type de département
        const departement = await Departement.findOne({
            where: { id_depart: num_depa },
            transaction
        });
        
        if (!departement) {
            throw new Error('Département introuvable');
        }
        const typeDepart = departement.type_depart;

        // 3. Gérer le fournisseur
        let fournisseurId = currentMaterial.code_four;
        if (nom_four) {
            if (fournisseurId) {
                // Mettre à jour le fournisseur existant
                await Fournisseur.update({
                    nom_four,
                    contact_four,
                    adresse_four
                }, {
                    where: { code_four: fournisseurId },
                    transaction
                });
            } else {
                // Créer un nouveau fournisseur
                const nouveauFournisseur = await Fournisseur.create({
                    nom_four,
                    contact_four,
                    adresse_four
                }, { transaction });
                fournisseurId = nouveauFournisseur.code_four;
            }
        } else if (fournisseurId) {
            await Fournisseur.destroy({
                where: { code_four: fournisseurId },
                transaction
            });
            fournisseurId = null;
        }

        // 4. Gérer le détenteur
        let detenteurId = currentMaterial.code_detent;
        if (attribue && nom_det && prenom_det) {
            if (detenteurId) {
                // Mettre à jour le détenteur existant
                await Detenteur.update({
                    nom_det,
                    prenom_det,
                    num_im,
                    fonction
                }, {
                    where: { code_detent: detenteurId },
                    transaction
                });
            } else {
                // Créer un nouveau détenteur
                const nouveauDetenteur = await Detenteur.create({
                    nom_det,
                    prenom_det,
                    num_im,
                    fonction
                }, { transaction });
                detenteurId = nouveauDetenteur.code_detent;
            }
        } else if (detenteurId) {
            // Supprimer le détenteur si la case attribué est décochée
            await Detenteur.destroy({
                where: { code_detent: detenteurId },
                transaction
            });
            detenteurId = null;
        }

        // 5. Gérer la direction (uniquement pour DST)
        let directionId = null;
        if (typeDepart === "DST" && nom_dir) {
            const directionExistante = await Direction.findOne({
                where: {
                    nom_dir,
                    type_dir: type_dir || null
                },
                transaction
            });

            if (directionExistante) {
                // Mettre à jour la direction existante
                await Direction.update({
                    nom_dir,
                    type_dir: type_dir || null
                }, {
                    where: { id_dir: directionExistante.id_dir },
                    transaction
                });
                directionId = directionExistante.id_dir;
            } else {
                // Créer une nouvelle direction
                const nouvelleDirection = await Direction.create({
                    nom_dir,
                    type_dir: type_dir || null
                }, { transaction });
                directionId = nouvelleDirection.id_dir;
            }
        }

        // 6. Gérer l'emplacement
        let emplacementId = currentMaterial.id_empl;
        if (num_depa) {
            if (emplacementId) {
                // Mettre à jour l'emplacement existant
                await Emplacement.update({
                    ville,
                    adresse_empl,
                    distrinct,
                    Region,
                    num_porte,
                    id_dir: directionId,
                    id_depart: num_depa
                }, {
                    where: { code_empl: emplacementId },
                    transaction
                });
            } else {
                // Créer un nouvel emplacement
                const nouvelEmplacement = await Emplacement.create({
                    ville,
                    adresse_empl,
                    distrinct,
                    Region,
                    num_porte,
                    id_dir: directionId,
                    id_depart: num_depa
                }, { transaction });
                emplacementId = nouvelEmplacement.code_empl;
            }
        } else if (emplacementId) {
            // Supprimer l'emplacement si aucun département n'est sélectionné
            await Emplacement.destroy({
                where: { code_empl: emplacementId },
                transaction
            });
            emplacementId = null;
        }

        // 7. Mettre à jour le matériel lui-même
        await Materiel.update({
            numero_serie,
            nom: nom_equi,
            modele,
            etat,
            type_equipement: type_equi,
            marque,
            date_entree: date_utilisation,
            id_cate: id_categorie,
            id_empl: emplacementId,
            code_detent: detenteurId,
            code_four: fournisseurId
        }, {
            where: { code_mat: materialId },
            transaction
        });

        await transaction.commit();
        
        res.json({ 
            success: true,
            message: 'Matériel modifié avec succès'
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Erreur:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Erreur serveur'
        });
    }
};

const supprimer = async (req, res) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();

        const materialId = req.params.id;

        // Vérifier que le matériel existe
        const currentMaterial = await Materiel.findByPk(materialId, { transaction });
        
        if (!currentMaterial) {
            return res.status(404).json({ error: "Matériel introuvable" });
        }

        // Supprimer les entités liées si elles existent
        if (currentMaterial.code_detent) {
            await Detenteur.destroy({
                where: { code_detent: currentMaterial.code_detent },
                transaction
            });
        }

        if (currentMaterial.code_four) {
            await Fournisseur.destroy({
                where: { code_four: currentMaterial.code_four },
                transaction
            });
        }

        // Supprimer l'emplacement si personne d'autre ne l'utilise
        if (currentMaterial.id_empl) {
            const emplacementUsage = await Materiel.count({
                where: { id_empl: currentMaterial.id_empl },
                transaction
            });
            
            if (emplacementUsage <= 1) { // Seul ce matériel l'utilise
                await Emplacement.destroy({
                    where: { code_empl: currentMaterial.id_empl },
                    transaction
                });
            }
        }

        await db.historique.destroy({
            where :{ code_mat: materialId },
            transaction
        })

        // Supprimer les maintenances liées
        await db.maintenance.destroy({
            where : {code_mat :materialId},
            transaction
        })


        // Supprimer le matériel lui-même
        await Materiel.destroy({
            where: { code_mat: materialId },
            transaction
        });

        await transaction.commit();
        
        res.json({ 
            success: true,
            message: 'Matériel et toutes ses dépendances supprimés avec succès'
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Erreur:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Erreur serveur'
        });
    }
};

module.exports = {
    Ajouter,
    recherche,
    getById,
    modifier,
    supprimer
};
