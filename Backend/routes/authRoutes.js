const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/profile/:id', auth, authController.getProfile);
router.get('/verify', authController.verifyToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-code', authController.verifyResetCode);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-reset-code', authController.resendResetCode);

module.exports = router;