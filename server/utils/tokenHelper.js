const jwt = require('jsonwebtoken');

// Generate a signed JWT for a given user ID
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Send the JWT and user data together — used in login and signup
const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Strip out sensitive fields before sending the user object
  const userPayload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    stats: user.stats,
    streak: user.streak,
    score: user.score,
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userPayload,
  });
};

module.exports = { signToken, createAndSendToken };
