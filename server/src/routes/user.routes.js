const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/auth');
const { getProfile, updateProfile, getAllUsers, promoteUser, deactivateUser } = require('../controllers/user.controller');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Admin only
router.get('/', protect, requireAdmin, getAllUsers);
router.put('/:id/promote', protect, requireAdmin, promoteUser);
router.put('/:id/deactivate', protect, requireAdmin, deactivateUser);

module.exports = router;
