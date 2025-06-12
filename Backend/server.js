const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const policeRoutes = require('./routes/PoliceRoutes');
const reportRoutes = require('./routes/reportRoutes');

const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append the file extension
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: 'tapasprajapati022@gmail.com',
        pass: 'csfjsvjhplursayu',
    },
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/CivicEye', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Create User Schema
const userSchema = new mongoose.Schema({
    name: String,
    age: Number,
    mobile: String,
    email: String,
    password: String
});

// Create Police Schema
const policeSchema = new mongoose.Schema({
    policeId: String,
    batchNo: String,
    rank: String,
    phone: String,
    station: String,
    email: String,
    password: String,
    isAdmin: { type: Boolean, default: false }
});

const reportSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    crimeType: String,
    date: Date,
    location: String,
    description: String,
    evidence: [String],
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User',userSchema);
const Police = mongoose.model('Police',policeSchema);
const Report = mongoose.model('Report', reportSchema);

app.post('/submit-report', upload.array('evidence'), async (req, res) => {
    try {
        console.log('Request Body:', req.body); // Debugging: Log the request body
        console.log('Uploaded Files:', req.files); // Debugging: Log the uploaded files

        const reportData = req.body;
        reportData.evidence = req.files.map(file => file.path); // Store file paths

        console.log('Report Data:', reportData); // Debugging: Log the report data
        
        const newReport = new Report(reportData);
        await newReport.save();
        await transporter.sendMail({
            from: 'tapasprajapati022@gmail.com',
            to: 'pesak481@gmail.com', 
            subject: 'New FIR Submitted - CivicEye',
            text: `
            New FIR Submitted:

            Name: ${reportData.name}
            Email: ${reportData.email}
            Phone: ${reportData.phone}
            Crime Type: ${reportData.crimeType}
            Date: ${reportData.date}
            Location: ${reportData.location}
            Description: ${reportData.description}

            Submitted At: ${new Date().toLocaleString()}
            `
            }, (error, info) => {
                if (error) {
                    console.error("Error sending email:", error);
                } else {
                    console.log("Email sent successfully:", info.response);
                }
        });



const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

 
// Registration Endpoints
app.post('/register/user', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.post('/register/police', async (req, res) => {
    try {
        const newPolice = new Police(req.body);
        await newPolice.save();
        res.status(201).send('Police officer registered successfully');
    } catch (error) {
        res.status(400).send(error.message);
    }
});


// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/police', policeRoutes);
app.use('/api/reports', reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});