const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: '',
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 10,
  },
  type: {
    type: String,
    enum: ['Notes', 'Book', 'PDF', 'PPT', 'Question Paper', 'Other'],
    required: [true, 'Material type is required'],
  },
  // For Question Papers — exam year e.g. 2023
  year: {
    type: Number,
    default: null,
  },
  // For Question Papers — exam type
  examType: {
    type: String,
    enum: ['Mid Semester', 'End Semester', 'Internal', 'University', 'Other', ''],
    default: '',
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL or path is required'],
  },
  fileName: {
    type: String,
    default: '',
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  mimeType: {
    type: String,
    default: '',
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  isApproved: {
    type: Boolean,
    default: true,
  },
  tags: [{ type: String, trim: true }],
}, { timestamps: true });

studyMaterialSchema.index({ title: 'text', description: 'text', subject: 'text', tags: 'text' });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
