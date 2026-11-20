const db = require('../models');
const { where, Op } = require('sequelize');
const materiel = db.materiel;
const emplacement = db.emplacement;
const categorie = db.categorie;
const detenteur = db.detenteur;
const direction = db.direction;
const fournisseur = db.fournisseur;
const maintenance = db.maintenance;
const historique = db.historique;
const technicien = db.technicien;

const getAllRapports = async (req, res) => {
    try {
        const rapports = await historique.findAll({
            include: [
                {
                    model: materiel,
                },
            ],
        });

        res.status(200).json(rapports);
    } catch (error) {
        console.error('Erreur de changement :', error);
        res.status(500).json({ message: 'Erreur de changement', error });
    }
};

const getMateriel = async (req, res) => {
    try {
        const {
            type_depart,
            region,
            district,
            type_dir,
            nom_dir,
            nom_det,
            num_im,
            fonction,
            attribue_only
        } = req.query;

        let whereClause = {};
        let emplacementWhere = {};
        let directionWhere = {};
        let detenteurWhere = {};

        // Filtre par type_depart
        if (type_depart) {
            whereClause['$Emplacement.Departement.type_depart$'] = type_depart;
        }

        // Filtres pour emplacement
        if (region) {
            emplacementWhere.Region = { [Op.like]: `%${region}%` };
        }
        if (district) {
            emplacementWhere.distrinct = { [Op.like]: `%${district}%` };
        }

        // Filtres pour direction (seulement si type_depart = 'DST')
        if (type_depart === 'DST') {
            if (type_dir) {
                directionWhere.type_dir = type_dir;
            }
            if (nom_dir) {
                directionWhere.nom_dir = { [Op.like]: `%${nom_dir}%` };
            }
        }

        // Filtres pour détenteur
        if (attribue_only === 'true') {
            whereClause.code_detent = { [Op.ne]: null };
        }
        if (nom_det && nom_det.trim() !== '') {
            detenteurWhere.nom_det = { [Op.like]: `%${nom_det.trim()}%` };
        }
        if (num_im && num_im.trim() !== '') {
            detenteurWhere.num_im = { [Op.like]: `%${num_im.trim()}%` };
        }
        if (fonction && fonction.trim() !== '') {
            detenteurWhere.fonction = { [Op.like]: `%${fonction.trim()}%` };
        }

        // Construire les options d'inclusion
        const include = [
            {
                model: categorie,
                attributes: ['nom_cate'],
            },
            {
                model: emplacement,
                attributes: ['Region', 'distrinct', 'ville'],
                where: Object.keys(emplacementWhere).length > 0 ? emplacementWhere : undefined,
                include: [
                    {
                        model: db.departement,
                        attributes: ['nom_depart', 'type_depart'],
                    },
                    {
                        model: direction,
                        attributes: ['nom_dir', 'type_dir'],
                        where: Object.keys(directionWhere).length > 0 ? directionWhere : undefined,
                        required: type_depart === 'DST' && (type_dir || nom_dir),
                    }
                ]
            },
            {
                model: detenteur,
                attributes: ['nom_det', 'num_im', 'fonction'],
                where: Object.keys(detenteurWhere).length > 0 ? detenteurWhere : undefined,
                required: attribue_only === 'true' || (nom_det && nom_det.trim() !== '') || (num_im && num_im.trim() !== '') || (fonction && fonction.trim() !== ''),
            }
        ];

        // Effectuer la requête
        const affichage = await materiel.findAll({
            where: whereClause,
            include: include,
        });

        res.status(200).json(affichage);
    } catch (error) {
        console.error('Erreur de changement materiels:', error);
        res.status(500).json({ message: 'Erreur de changement ', error });
    }
};

const affichageAffect = async (req, res) => {
    try {
        const {date_affec,etat,nom} = req.query; 

        let whereClause = {};
        if (date_affec) {
            whereClause.date_mouvement = { [Op.like]: `%${date_affec}%` };
        }

        const materielWhere = {};
    
        if (etat) {
            materielWhere.etat = etat;
        }
        if(nom) {
            materielWhere.nom= { [Op.like]: `%${nom}%` }
        }

        const include = [
            {
                model: materiel,
                attributes: ['code_mat', 'nom', 'numero_serie', 'marque', 'etat'],
                required : !!etat || !!nom,
                where: Object.keys(materielWhere).length > 0 ? materielWhere : undefined,
                include: [
                    {
                        model: detenteur,
                        attributes: ['num_im'],
            
                    }
                ]
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
        ];

        const affectations = await historique.findAll({
            where: whereClause,
            include,
        });

        const formattedHistorique = affectations.map(h => ({
            id_hist: h.id_hist,
            type_hist: h.type_hist,
            date_mouvement: h.date_mouvement,
            materiel: {
                code_mat: h.Materiel?.code_mat,
                nom: h.Materiel?.nom,
                numero_serie: h.Materiel?.numero_serie,
                marque: h.Materiel?.marque,
                etat: h.Materiel?.etat
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

        res.status(200).json(formattedHistorique);
    } catch (error) {
        console.error('Erreur de changement  affectations:', error);
        res.status(500).json({ message: 'Erreur de changement ', error });
    }
};


const affichageMain = async (req, res) => {
    try {
        const { statut,type_main , date_main,search} = req.query; 

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
        if (date_main){
            whereClause.date_main= date_main;
        }

        const maintenances = await maintenance.findAll({
            where: whereClause,
            include: [
                {
                    model: materiel,
                },
                {
                    model : technicien,
                },
            ],
        });

        res.status(200).json(maintenances);
    } catch (error) {
        console.error('Erreur de chamgement de maintenances:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

const nombrePanne = async (req, res) => {
    try {
        const count = await materiel.count({
            where: {
                etat: 'en panne',
            },
        });
        res.status(200).json({ count });
    } catch (error) {
        console.error('Erreur de compter:', error);
        res.status(500).json({ message: 'Erreur de serveur ', error });
    }
};
const nombreMat = async (req ,res) =>{
    try {
        const count = await materiel.count();
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error counting materiels:', error);
        res.status(500).json({ message: 'Erreur de serveur', error });
    }
}

const matPanne =async (req,res) =>{
    try{
        const afficher = await materiel.findAll({
            include : [
                {
                model :emplacement,
                attributes : ['Region','distrinct','adresse_empl'],
                include :[
                    {
                        model : db.departement,
                        attributes :['type_depart','nom_depart']
                    }
                ]
                }
                
            ],
            where : {
                etat :'en panne',
            }
        })
        res.status(200).json(afficher)
    }catch(error){
        console.error('erreur de changement:', error);
        res.status(500).json({ message: 'Erreur de serveur', error });
    }
}

const affihcgeEnCours = async (req,res)=>{
    try{
        const afficher  = await maintenance.findAll({
            include :[
                {
                    model : materiel,
                    attributes : ['code_mat','nom','numero_serie','marque','etat'],
                },
                {
                    model : technicien,
                    attributes : ['nom_techn','prenom_techn']
                }
            ],
            where : {
                statut : 'en_cours'
            },
            
        })


        res.status(200).json(afficher)



    }catch(error){
        console.error('erreur de changement:', error);
        res.status(500).json({ message: 'Erreur de serveur ', error });
    }
}

const nombreMaintenance = async(req,res)=>{
    try {
        const nombre  = await maintenance.count({
            where :{
                statut : 'en_cours'
            }
        })
        res.status(200).json({nombre})
    } catch (error) {
        console.error('erreur de changement:', error);
        res.status(500).json({ message: 'Erreur de serveur ', error });
    }

}
const nombreAtttribue = async(req,res) => {
    try {
        const nombre = await materiel.count({
            where: {
                code_detent: { [Op.ne]: null }
            }
        });
        res.status(200).json({ nombre });
    } catch (error) {
        console.error('erreur de changement:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};
const afficherMaterieNonAttribue = async(req,res) =>{
    try {
        const afficher = await materiel.findAll({
            include : [
                {
                    model : emplacement ,
                    attributes :['Region','distrinct'],
                    include : [
                        {
                            model : db.departement,
                            attributes : ['type_depart']
                        },
                        {
                            model : db.direction,
                            attributes : ['nom_dir']
                        }
                    ]
                }
            ],
            where : {
                code_detent : null ,
            }
        })
        res.status(200).json(afficher)
    } catch (error) {
        console.error('erreur de changement:', error);
        res.status(500).json({ message: 'Erreur de serveur ', error });
    }
}

const activiteMensuelle = async (req, res) => {
    try {
        const listMaintenances = await maintenance.findAll({
            attributes: ['date_main', 'statut']
        });

        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        
        // Initialize last 7 months
        const result = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = d.getFullYear();
            const monthIndex = d.getMonth();
            const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
            result.push({
                key: key,
                month: months[monthIndex],
                value: 0
            });
        }

        listMaintenances.forEach(m => {
            if (m.date_main) {
                const parts = String(m.date_main).split('-');
                if (parts.length >= 2) {
                    const key = `${parts[0]}-${parts[1]}`;
                    const found = result.find(r => r.key === key);
                    if (found) {
                        found.value += 1;
                    }
                }
            }
        });

        const formattedResult = result.map(r => ({
            month: r.month,
            value: r.value
        }));

        res.status(200).json(formattedResult);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'activité mensuelle :', error);
        res.status(500).json({ message: 'Erreur de serveur', error });
    }
};


module.exports = {
    getAllRapports,
    getMateriel,
    nombrePanne,
    affichageAffect,
    affichageMain,
    nombreMat,
    matPanne,
    affihcgeEnCours,
    nombreMaintenance,
    nombreAtttribue,
    afficherMaterieNonAttribue,
    activiteMensuelle
};