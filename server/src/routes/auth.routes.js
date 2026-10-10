const express = require('express');
const router = express.Router();
const { register, login, getMe, initAdmin } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/init-admin', initAdmin); // one-time admin creation via secret key

module.exports = router;
