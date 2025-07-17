// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');

// // Login route
// router.post('/login', authController.login);

// // Profile route
// router.get('/profile/:id', authController.getProfile);

// module.exports = router;



const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/profile/:id', auth, authController.getProfile);
router.get('/verify', authController.verifyToken);

module.exports = router;