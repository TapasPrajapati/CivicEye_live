import express from 'express';
import { submitContactForm } from '../controllers/contactController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 submits per hour
  message: 'Too many contact attempts from this IP, please try again later'
});

router.post('/contact', contactLimiter, submitContactForm);

export default router;