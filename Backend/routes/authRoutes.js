

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/profile/:id', auth, authController.getProfile);
router.get('/verify', authController.verifyToken);

module.exports = router;