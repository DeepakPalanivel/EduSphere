const express = require('express');
const router = express.Router();
const { protect, requireAdmin, optionalAuth } = require('../middleware/auth');
const {
  getSoftwareList, getSoftware, createSoftware, updateSoftware, deleteSoftware
} = require('../controllers/software.controller');

router.get('/', optionalAuth, getSoftwareList);
router.get('/:id', optionalAuth, getSoftware);
router.post('/', protect, requireAdmin, createSoftware);
router.put('/:id', protect, requireAdmin, updateSoftware);
router.delete('/:id', protect, requireAdmin, deleteSoftware);

module.exports = router;
