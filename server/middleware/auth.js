const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Deep verification: Fetch user from DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ msg: "User no longer exists" });
    }

    req.user = user; // Set the full Mongoose document to req.user
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

// Retaining this so the admin-only routes (like creating/deleting questions) don't break
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // In your simple protect snippet, role isn't embedded in the token payload.
    // If you plan to use this, you'll need to embed `role` inside the token during login
    // e.g. jwt.sign({ id: user._id, role: user.role }, "secret")
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo };
