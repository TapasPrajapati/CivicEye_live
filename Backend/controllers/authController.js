const User = require('../models/User');
const Police = require('../models/Police');

exports.login = async (req, res) => {
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
};

exports.getProfile = async (req, res) => {
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
};