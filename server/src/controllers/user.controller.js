const { z } = require('zod');
const User = require('../models/User');

const updateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  department: z.string().max(100).optional(),
  course: z.string().max(100).optional(),
  yearOfStudy: z.number().min(1).max(6).optional(),
});

const getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const user = await User.findByIdAndUpdate(req.user._id, parsed.data, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated.', user });
  } catch (err) { next(err); }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const p = Math.max(1, parseInt(page));
    const l = Math.min(100, Math.max(1, parseInt(limit)));
    const query = search ? { $or: [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
    const [users, total] = await Promise.all([
      User.find(query).skip((p - 1) * l).limit(l).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);
    res.json({ success: true, data: users, pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) } });
  } catch (err) { next(err); }
};

const promoteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: `${user.fullName} promoted to admin.`, user });
  } catch (err) { next(err); }
};

const deactivateUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: `${user.fullName} has been deactivated.`, user });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, getAllUsers, promoteUser, deactivateUser };
