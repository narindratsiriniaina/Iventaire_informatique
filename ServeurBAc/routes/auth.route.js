const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/user/me', authController.getCurrentUser);
router.post('/register', authController.register);
router.get('/affichage', authController.affichage);
router.put('/user/:id_use', authController.updateUser);
router.delete('/user/:id_use', authController.deleteUser);
router.post('/reset-password/:id_use', authController.resetPassword);

module.exports = router;