const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
    password: String
});

const User = mongoose.model('User', userSchema);
const Police = mongoose.model('Police', policeSchema);

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

// Login Endpoint
// Login Endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email, password });
        if (user) {
            return res.status(200).json({ type: 'user', data: user });
        }

        // Check if the police officer exists
        const police = await Police.findOne({ email, password });
        if (police) {
            return res.status(200).json({ type: 'police', data: police });
        }

        // If no user or police officer is found
        res.status(404).send('Invalid credentials');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Fetch User/Police Data Endpoint
app.get('/profile/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the ID belongs to a user
        const user = await User.findById(id);
        if (user) {
            return res.status(200).json(user);
        }

        // Check if the ID belongs to a police officer
        const police = await Police.findById(id);
        if (police) {
            return res.status(200).json(police);
        }

        // If no user or police officer is found
        res.status(404).send('Profile not found');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
