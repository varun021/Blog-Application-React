const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const UserSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: [true, 'First name is required'], 
    trim: true 
  },
  lastName: { 
    type: String, 
    required: [true, 'Last name is required'], 
    trim: true 
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'], 
    minlength: 6 
  },
  phone: { 
    type: String, 
    trim: true, 
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number'] 
  },
  dob: { 
    type: Date 
  },
  address: { 
    type: String, 
    trim: true 
  },
  profilePhoto: { 
    type: String,
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
     // Provide a default photo if none is uploaded
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
