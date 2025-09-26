// controllers/UserController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.registerUser = async (req, res) => {
  try {
    const { name, email, age ,password, mobile } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !password || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and mobile are required'
      });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

   

    // ✅ Create new user
    const newUser = new User({
      name,
      email,
      age,
      password,
      mobile,
      age
    });

    await newUser.save();

    // ✅ Send success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser._id,
        age: newUser.age,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile
      }
    });

  } catch (error) {
    console.error("❌ Registration error:", error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
