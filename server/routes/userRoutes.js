const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

// Helper function to generate JWT
const generateToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = { user: { id: userId } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });
};

// Helper function to send email
const sendEmail = (to, subject, text) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = { to, from: process.env.EMAIL_USER, subject, text };

    transporter.sendMail(mailOptions, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Signup Route
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User with this email already exists' });

    user = new User({
      firstName,
      lastName,
      email,
      password
    });

    await user.save();

    const token = await generateToken(user.id);
    res.status(201).json({ token });
  } catch (err) {
    console.error('Signup Error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = await generateToken(user.id);
    res.json({ token });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`;
    const emailText = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      ${resetUrl}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`;

    await sendEmail(user.email, 'Password Reset', emailText);
    res.json({ msg: 'An email has been sent with further instructions' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ msg: 'Token is invalid or has expired' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET Profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// PUT Update Profile
router.put('/profile', authenticate, upload.single('profilePhoto'), async (req, res) => {
  const { firstName, lastName, email, phone, dob, address } = req.body;
  const profilePhoto = req.file ? req.file.filename : undefined;

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update the profile data
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (dob) user.dob = dob;
    if (address) user.address = address;
    if (profilePhoto) user.profilePhoto = profilePhoto;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router;
