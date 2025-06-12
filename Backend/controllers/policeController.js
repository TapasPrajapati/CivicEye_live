const Police = require('../models/Police');

exports.registerPolice = async (req, res) => {
    try {
        const newPolice = new Police(req.body);
        await newPolice.save();
        res.status(201).send('Police officer registered successfully');
    } catch (error) {
        res.status(400).send(error.message);
    }
};