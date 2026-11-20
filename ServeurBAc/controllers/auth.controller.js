const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.user;
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
    const { nom_user, password } = req.body;
    const user = await User.findOne({ where: { nom_user } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Identifiants invalides' });
    }
    const token = jwt.sign({ id_use: user.id_use, nom_user: user.nom_user, type_user: user.type_user }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '10h' });
    res.json({ token });
};

exports.getCurrentUser = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'Non autorisé' });
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        const user = await User.findByPk(decoded.id_use, {
            attributes: ['id_use', 'nom_user', 'type_user', 'avatar']
        });
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.json(user);
    } catch (error) {
        console.error('Erreur getCurrentUser:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.affichage = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id_use', 'nom_user', 'type_user', 'avatar'],
            order: [['id_use', 'ASC']]
        });
        res.json(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
};

exports.register = async (req, res) => {
    const { nom_user, password, type_user, avatar } = req.body;

    try {
        const existingUser = await User.findOne({ where: { nom_user } });
        if (existingUser) {
            return res.status(400).json({ message: 'Utilisateur déjà existant' });
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
      
        const newUser = await User.create({
            nom_user,
            password: hashedPassword,
            type_user: type_user || 'user',
            avatar: avatar || null
        });

        res.status(201).json({ message: 'Utilisateur créé avec succès', userId: newUser.id_use });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    const { id_use } = req.params;
    const { nom_user, password, type_user, avatar } = req.body;
    try {
        const user = await User.findByPk(id_use);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        
        const updateData = {
            nom_user: nom_user || user.nom_user,
            type_user: type_user || user.type_user,
            avatar: avatar !== undefined ? avatar : user.avatar
        };
        
        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }
        
        await User.update(updateData, { where: { id_use } });
        res.json({ message: 'Utilisateur mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur MAJ utilisateur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id_use } = req.params;
    try {
        const user = await User.findByPk(id_use);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        
        await User.destroy({ where: { id_use } });
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error('Erreur suppression:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.resetPassword = async (req, res) => {
    const { id_use } = req.params;
    try {
        const user = await User.findByPk(id_use);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        const tempPassword = Math.random().toString(36).slice(-8); // Generate random 8-character password
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        await User.update({ password: hashedPassword }, { where: { id_use } });
        res.json({ message: 'Mot de passe réinitialisé avec succès', tempPassword });
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
        res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
    }
};