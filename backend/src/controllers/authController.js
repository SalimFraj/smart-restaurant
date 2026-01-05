import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address
    });

    const token = generateToken(user._id);

    // Determine cookie settings
    const isProduction = process.env.NODE_ENV === 'production' || process.env.Render_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      // Always use secure in production or if explicitly on HTTPS
      secure: isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https',
      // Cross-site requires 'none', local development can use 'lax'
      sameSite: (isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https') ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN })
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    // Determine cookie settings
    const isProduction = process.env.NODE_ENV === 'production' || process.env.Render_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      // Always use secure in production or if explicitly on HTTPS
      secure: isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https',
      // Cross-site requires 'none', local development can use 'lax'
      sameSite: (isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https') ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN })
    });

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  // Determine cookie settings
  const isProduction = process.env.NODE_ENV === 'production' || process.env.Render_ENV === 'production';

  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: (isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https') ? 'none' : 'lax',
    expires: new Date(0)
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id.toString(),
      _id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      address: req.user.address
    }
  });
};

