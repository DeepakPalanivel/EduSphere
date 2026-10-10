const express = require('express');
const router = express.Router();
const { protect, requireAdmin, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getMaterials, getMaterial, uploadMaterial, updateMaterial, deleteMaterial, downloadMaterial
} = require('../controllers/material.controller');

router.get('/', optionalAuth, getMaterials);
router.get('/:id', optionalAuth, getMaterial);
router.get('/:id/download', protect, downloadMaterial);
router.post('/', protect, upload.single('file'), uploadMaterial);
router.put('/:id', protect, updateMaterial);
router.delete('/:id', protect, deleteMaterial);

module.exports = router;
