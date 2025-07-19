const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error('No token provided');

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) throw new Error('Invalid token');

        req.user = verified;
        next();
    } catch (error) {
        res.status(401).send('Please authenticate');
    }
};

module.exports = auth;