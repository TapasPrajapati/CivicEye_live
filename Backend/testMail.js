const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tapasprajapati022@gmail.com',
    pass: 'csfjsvjhplursayu' 
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Login failed:', error);
  } else {
    console.log('Server is ready to send messages');
  }
});
