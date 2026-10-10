const path = require('path');
const fs = require('fs');
const { z } = require('zod');
const StudyMaterial = require('../models/StudyMaterial');
const { paginate, paginatedResponse } = require('../utils/pagination');

const materialSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional().default(''),
  subject: z.string().min(1).max(100),
  department: z.string().min(1).max(100),
  semester: z.coerce.number().min(1).max(10),
  type: z.enum(['Notes', 'Book', 'PDF', 'PPT', 'Question Paper', 'Other']),
  year: z.coerce.number().min(2000).max(2100).nullable().optional(),
  examType: z.enum(['Mid Semester', 'End Semester', 'Internal', 'University', 'Other', '']).optional().default(''),
  tags: z.string().optional().default(''),
});

const getMaterials = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12, search,
      department, semester, type,
      year, examType,
      sort = 'newest',
    } = req.query;

    const { skip, limit: lim, page: p } = paginate(page, limit);

    const filter = { isApproved: true };
    if (department) filter.department = { $regex: department, $options: 'i' };
    if (semester)   filter.semester   = parseInt(semester);
    if (type)       filter.type       = type;
    if (year)       filter.year       = parseInt(year);
    if (examType)   filter.examType   = examType;

    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { subject:     { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags:        { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortOpt = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const [materials, total] = await Promise.all([
      StudyMaterial.find(filter)
        .populate('uploader', 'fullName')
        .sort(sortOpt)
        .skip(skip)
        .limit(lim),
      StudyMaterial.countDocuments(filter),
    ]);

    res.json({ success: true, ...paginatedResponse(materials, total, p, lim) });
  } catch (err) { next(err); }
};

const getMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id).populate('uploader', 'fullName email');
    if (!material) return res.status(404).json({ success: false, message: 'Material not found.' });
    res.json({ success: true, data: material });
  } catch (err) { next(err); }
};

const uploadMaterial = async (req, res, next) => {
  try {
    const parsed = materialSchema.safeParse(req.body);
    if (!parsed.success) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    let fileUrl, fileName, fileSize, mimeType;

    if (req.file) {
      fileUrl  = `/uploads/materials/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      mimeType = req.file.mimetype;
    } else if (req.body.fileUrl) {
      fileUrl  = req.body.fileUrl;
      fileName = req.body.fileName || '';
    } else {
      return res.status(400).json({ success: false, message: 'A file or external URL is required.' });
    }

    const { title, description, subject, department, semester, type, year, examType, tags } = parsed.data;
    const tagArr = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    const material = await StudyMaterial.create({
      title, description, subject, department, semester, type,
      year: year || null,
      examType: examType || '',
      fileUrl, fileName, fileSize, mimeType,
      uploader: req.user._id,
      tags: tagArr,
    });

    await material.populate('uploader', 'fullName');
    res.status(201).json({ success: true, message: 'Material uploaded successfully.', data: material });
  } catch (err) {
    if (req.file) { try { fs.unlinkSync(req.file.path); } catch (_) {} }
    next(err);
  }
};

const updateMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found.' });

    const isOwner = material.uploader.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only edit your own uploads.' });
    }

    const allowed = ['title', 'description', 'subject', 'department', 'semester', 'type', 'year', 'examType', 'tags', 'isApproved'];
    allowed.forEach(f => { if (req.body[f] !== undefined) material[f] = req.body[f]; });
    await material.save();
    res.json({ success: true, message: 'Material updated.', data: material });
  } catch (err) { next(err); }
};

const deleteMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found.' });

    const isOwner = material.uploader.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own uploads.' });
    }

    if (material.fileUrl && material.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', '..', material.fileUrl);
      try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
    }

    await material.deleteOne();
    res.json({ success: true, message: 'Material deleted successfully.' });
  } catch (err) { next(err); }
};

const downloadMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found.' });

    material.downloadCount += 1;
    await material.save();

    if (!material.fileUrl.startsWith('/uploads/')) {
      return res.redirect(material.fileUrl);
    }

    const filePath = path.join(__dirname, '..', '..', material.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server.' });
    }
    res.download(filePath, material.fileName || 'download');
  } catch (err) { next(err); }
};

module.exports = { getMaterials, getMaterial, uploadMaterial, updateMaterial, deleteMaterial, downloadMaterial };
