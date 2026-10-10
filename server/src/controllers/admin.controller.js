const User = require('../models/User');
const StudyMaterial = require('../models/StudyMaterial');
const Software = require('../models/Software');

const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStudents, totalAdmins, totalMaterials, totalSoftware, recentMaterials, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      StudyMaterial.countDocuments(),
      Software.countDocuments(),
      StudyMaterial.find().sort({ createdAt: -1 }).limit(5).populate('uploader', 'fullName'),
      User.find().sort({ createdAt: -1 }).limit(5).select('fullName email role createdAt'),
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalStudents, totalAdmins, totalMaterials, totalSoftware },
        recentMaterials,
        recentUsers,
      },
    });
  } catch (err) { next(err); }
};

const getUnapprovedMaterials = async (req, res, next) => {
  try {
    const materials = await StudyMaterial.find({ isApproved: false })
      .populate('uploader', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: materials, total: materials.length });
  } catch (err) { next(err); }
};

const approveMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!material) return res.status(404).json({ success: false, message: 'Material not found.' });
    res.json({ success: true, message: 'Material approved.', data: material });
  } catch (err) { next(err); }
};

module.exports = { getStats, getUnapprovedMaterials, approveMaterial };
