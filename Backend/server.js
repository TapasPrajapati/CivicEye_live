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

app.get('/login', async function(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid Email' });
        }

        const validPassword = await user.comparePassword(password);

        if (validPassword) {
            // Return a token for future requests
            const token = generateToken();
            res.json({ success: true, token });
        } else {
            res.status(401).json({ success: false, message: 'Invalid Password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
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

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});