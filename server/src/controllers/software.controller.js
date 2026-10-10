const { z } = require('zod');
const Software = require('../models/Software');
const { paginate, paginatedResponse } = require('../utils/pagination');

const softwareSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().min(1).max(1000),
  category: z.enum(['Programming', 'Design', 'Productivity', 'AI Tools', 'Cloud Computing', 'Office Applications', 'Other']),
  officialWebsite: z.string().url('Must be a valid URL'),
  pricingUrl: z.string().url().optional().or(z.literal('')).default(''),
  accessType: z.enum(['Free', 'Free Tier', 'Student Plan', 'Paid', 'Campus Licence']),
  accessInstructions: z.string().max(1000).optional().default(''),
  logoUrl: z.string().optional().default(''),
  isVerified: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
});

const getSoftwareList = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, category, accessType } = req.query;
    const { skip, limit: lim, page: p } = paginate(page, limit);

    const filter = {};
    if (category) filter.category = category;
    if (accessType) filter.accessType = accessType;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [software, total] = await Promise.all([
      Software.find(filter).sort({ name: 1 }).skip(skip).limit(lim),
      Software.countDocuments(filter),
    ]);

    res.json({ success: true, ...paginatedResponse(software, total, p, lim) });
  } catch (err) { next(err); }
};

const getSoftware = async (req, res, next) => {
  try {
    const software = await Software.findById(req.params.id);
    if (!software) return res.status(404).json({ success: false, message: 'Software not found.' });
    res.json({ success: true, data: software });
  } catch (err) { next(err); }
};

const createSoftware = async (req, res, next) => {
  try {
    const parsed = softwareSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }
    const software = await Software.create({ ...parsed.data, addedBy: req.user._id, lastVerifiedDate: parsed.data.isVerified ? new Date() : null });
    res.status(201).json({ success: true, message: 'Software added successfully.', data: software });
  } catch (err) { next(err); }
};

const updateSoftware = async (req, res, next) => {
  try {
    const software = await Software.findById(req.params.id);
    if (!software) return res.status(404).json({ success: false, message: 'Software not found.' });

    const updatable = ['name', 'description', 'category', 'officialWebsite', 'pricingUrl', 'accessType', 'accessInstructions', 'logoUrl', 'isVerified', 'tags'];
    updatable.forEach(f => { if (req.body[f] !== undefined) software[f] = req.body[f]; });
    if (req.body.isVerified) software.lastVerifiedDate = new Date();
    await software.save();
    res.json({ success: true, message: 'Software updated.', data: software });
  } catch (err) { next(err); }
};

const deleteSoftware = async (req, res, next) => {
  try {
    const software = await Software.findByIdAndDelete(req.params.id);
    if (!software) return res.status(404).json({ success: false, message: 'Software not found.' });
    res.json({ success: true, message: 'Software deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getSoftwareList, getSoftware, createSoftware, updateSoftware, deleteSoftware };
