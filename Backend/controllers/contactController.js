// File: src/Backend/controllers/contactController.js

// Example: submitContactForm controller
const submitContactForm = (req, res) => {
  const { name, email, message } = req.body;

  // Simple validation
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Here you can add code to save to DB or send email
  // For example, just returning a success response for now
  res.status(200).json({
    success: true,
    message: 'Contact form submitted successfully',
    data: { name, email, message }
  });
};

module.exports = { submitContactForm };
