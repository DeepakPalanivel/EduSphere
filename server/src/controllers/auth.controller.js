const { z } = require('zod');
const User = require('../models/User');
const { sendTokenResponse } = require('../utils/jwt');

const registerSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  confirmPassword: z.string(),
  department: z.string().max(100).optional().default(''),
  course: z.string().max(100).optional().default(''),
  yearOfStudy: z.number().min(1).max(6).optional().default(1),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const { fullName, email, password, department, course, yearOfStudy } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({ fullName, email, password, department, course, yearOfStudy });
    sendTokenResponse(user, 201, res, 'Account created successfully.');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    sendTokenResponse(user, 200, res, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/init-admin
const initAdmin = async (req, res, next) => {
  try {
    const { adminKey, fullName, email, password } = req.body;

    if (!process.env.ADMIN_INIT_KEY || adminKey !== process.env.ADMIN_INIT_KEY) {
      return res.status(403).json({ success: false, message: 'Invalid admin initialization key.' });
    }

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(409).json({ success: false, message: 'An admin account already exists. Use the promote endpoint instead.' });
    }

    if (!fullName || !email || !password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Provide fullName, email, and password (min 6 chars).' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = 'admin';
      await existing.save();
      return sendTokenResponse(existing, 200, res, 'Existing user promoted to admin.');
    }

    const admin = await User.create({ fullName, email, password, role: 'admin', department: 'Administration', course: 'N/A', yearOfStudy: 1 });
    sendTokenResponse(admin, 201, res, 'Admin account created successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, initAdmin };
