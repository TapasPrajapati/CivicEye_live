// const mongoose = require('mongoose');

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect('mongodb://127.0.0.1:27017/CivicEye', {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });

//         console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
//     } catch (error) {
//         console.error('❌ MongoDB connection failed:', error.message);
//         process.exit(1);
//     }
// };

// module.exports = connectDB;


const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;