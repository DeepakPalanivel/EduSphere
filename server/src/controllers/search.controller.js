const StudyMaterial = require('../models/StudyMaterial');
const Software = require('../models/Software');

const globalSearch = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters.' });
    }

    const lim = Math.min(20, Math.max(1, parseInt(limit)));
    const regex = { $regex: q.trim(), $options: 'i' };

    const [materials, software] = await Promise.all([
      StudyMaterial.find({
        isApproved: true,
        $or: [{ title: regex }, { subject: regex }, { description: regex }],
      }).limit(lim).populate('uploader', 'fullName').select('title subject department semester type createdAt'),

      Software.find({
        $or: [{ name: regex }, { description: regex }, { category: regex }],
      }).limit(lim).select('name category accessType officialWebsite isVerified'),
    ]);

    res.json({
      success: true,
      query: q,
      results: {
        materials: { data: materials, count: materials.length },
        software: { data: software, count: software.length },
      },
      total: materials.length + software.length,
    });
  } catch (err) { next(err); }
};

module.exports = { globalSearch };
