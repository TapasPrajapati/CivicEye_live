const User = require('../models/User');
const Police = require('../models/Police');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email, password });
        if (user) {
            const token = jwt.sign(
                { id: user._id, type: 'user' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '8h' }
            );
            return res.status(200).json({ 
                type: 'user', 
                data: user,
                token 
            });
        }

        // Check if the police officer exists
        const police = await Police.findOne({ email, password });
        if (police) {
            const token = jwt.sign(
                { id: police._id, type: 'police' }, 
                process.env.JWT_SECRET, 
                { expiresIn: '8h' }
            );
            return res.status(200).json({ 
                type: 'police', 
                data: police,
                token 
            });
        }

        res.status(404).send('Invalid credentials');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.user; // From JWT middleware

        if (type === 'user') {
            const user = await User.findById(id);
            if (!user) return res.status(404).send('User not found');
            return res.status(200).json(user);
        } else if (type === 'police') {
            const police = await Police.findById(id);
            if (!police) return res.status(404).send('Police not found');
            return res.status(200).json(police);
        }

        res.status(400).send('Invalid user type');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.verifyToken = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json(false);
        
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) return res.status(401).json(false);

        const user = verified.type === 'user' 
            ? await User.findById(verified.id)
            : await Police.findById(verified.id);

        if (!user) return res.status(401).json(false);

        return res.status(200).json({
            type: verified.type,
            data: user,
            token
        });
    } catch (error) {
        res.status(500).json(false);
    }
};