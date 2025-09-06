const User = require('../models/User');
const Police = require('../models/Police');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});


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

// Forgot Password - Send reset code
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if user exists in either collection
    const user = await User.findOne({ email }) || await Police.findOne({ email });
    
    if (!user) {
      // For security, don't reveal if email exists
      return res.status(200).json({ 
        success: true, 
        message: 'If the email exists, a reset code has been sent' 
      });
    }

    // Generate 6-digit reset code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    
    // Set expiration (10 minutes from now)
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    // Save reset code to user document
    user.resetCode = resetCode;
    user.resetCodeExpires = resetCodeExpires;
    await user.save();

    // Send email with reset code
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'CivicEye - Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">CivicEye Password Reset</h2>
          <p>You requested a password reset. Use the following code to reset your password:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1e40af; margin: 0; font-size: 32px;">${resetCode}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">CivicEye Emergency Reporting System</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'If the email exists, a reset code has been sent' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
};

// Verify Reset Code
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and code are required' 
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }) || await Police.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid reset code' 
      });
    }

    // Check if reset code matches and hasn't expired
    if (user.resetCode !== code || user.resetCodeExpires < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset code' 
      });
    }

    // Generate a temporary token for password reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Code verified successfully',
      token: resetToken
    });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!email || !newPassword || !token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, new password, and token are required' 
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }) || await Police.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Verify reset token
    if (user.resetToken !== token || user.resetTokenExpires < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    // Update password and clear reset fields
    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Password reset successfully' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
};

// Resend Reset Code
exports.resendResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }) || await Police.findOne({ email });
    
    if (!user) {
      // For security, don't reveal if email exists
      return res.status(200).json({ 
        success: true, 
        message: 'If the email exists, a reset code has been sent' 
      });
    }

    // Generate new 6-digit reset code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    
    // Set expiration (10 minutes from now)
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    // Save new reset code
    user.resetCode = resetCode;
    user.resetCodeExpires = resetCodeExpires;
    await user.save();

    // Send email with new reset code
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'CivicEye - New Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">CivicEye Password Reset</h2>
          <p>Here is your new reset code:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1e40af; margin: 0; font-size: 32px;">${resetCode}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">CivicEye Emergency Reporting System</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true, 
      message: 'If the email exists, a new reset code has been sent' 
    });

  } catch (error) {
    console.error('Resend reset code error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
};