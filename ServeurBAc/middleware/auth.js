const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.user;

const authMiddleware = (requiredRole = 'user') => {
  return async (req, res, next) => {
    try {
      // Extraire le token depuis l'en-tête
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Aucun token fourni' });
      }

      // Vérifier et décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id_use);

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Vérifier le rôle de l'utilisateur
      const userRole = decoded.type_user || user.type_user;
      if (requiredRole === 'admin' && userRole !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé. Niveau d\'autorisation insuffisant' });
      }

      // Attacher l'utilisateur à la requête pour usage ultérieur
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token invalide', error: error.message });
    }
  };
};

module.exports = authMiddleware;