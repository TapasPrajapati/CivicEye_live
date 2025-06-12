// const express = require('express');
// const router = express.Router();
// const profileController = require('../controllers/profileController');

// router.get('/:id', profileController.getProfile);

// module.exports = router;


const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// User registration route
router.post('/register/user', userController.registerUser);

module.exports = router;