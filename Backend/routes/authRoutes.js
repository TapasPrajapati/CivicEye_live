const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login route
router.post('/login', authController.login);

// Profile route
router.get('/profile/:id', authController.getProfile);

module.exports = router;