const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/auth');
const { getStats, getUnapprovedMaterials, approveMaterial, runSeed } = require('../controllers/admin.controller');

router.use(protect, requireAdmin);

router.get('/stats', getStats);
router.get('/materials/unapproved', getUnapprovedMaterials);
router.put('/materials/:id/approve', approveMaterial);
router.post('/seed', runSeed);

module.exports = router;
