const express = require('express');
const router = express.Router();
const policeController = require('../controllers/policeController');

// Police registration route
router.post('/register/police', policeController.registerPolice);

module.exports = router;