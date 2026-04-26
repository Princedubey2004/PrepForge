const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError, catchAsync } = require('../utils/AppError');

// helper function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// SIGNUP
const signup = async (req, res) => {
  console.log(`[Auth] Signup attempt for: ${req.body.email}`);
  
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // 1. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`[Auth] Signup failed: Email ${email} already exists`);
      return res.status(400).json({ message: "Email already exists" });
    }

    // 2. Hash password (using 10 rounds for standard security/speed)
    console.log(`[Auth] Hashing password...`);
    const hashed = await bcrypt.hash(password, 10);

    // 3. Create user
    console.log(`[Auth] Creating user in database...`);
    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    // 4. Generate token
    const token = generateToken(user._id);

    console.log(`[Auth] Signup successful for ${email} ✅`);
    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('[Auth] CRITICAL Signup Error:', error.message);
    res.status(500).json({ 
      message: "Something went wrong during signup. Please check your database connection.",
      error: error.message 
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Retaining these methods so the Profile and Dashboard features don't break
const getMe = catchAsync(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

const updateProfile = catchAsync(async (req, res, next) => {
  const { name, bio, avatar } = req.body;
  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { name, bio, avatar },
    { new: true, runValidators: true }
  );
  res.status(200).json({ success: true, user: updated });
});

const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return next(new AppError('Your current password is incorrect.', 401));
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.status(200).json({ success: true, token, user });
});

module.exports = { signup, login, getMe, updateProfile, changePassword };
