const mongoose = require('mongoose');

const softwareSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Software name is required'],
    trim: true,
    maxlength: [150, 'Name cannot exceed 150 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Programming', 'Design', 'Productivity', 'AI Tools', 'Cloud Computing', 'Office Applications', 'Other'],
  },
  officialWebsite: {
    type: String,
    required: [true, 'Official website URL is required'],
    trim: true,
  },
  pricingUrl: {
    type: String,
    trim: true,
    default: '',
  },
  accessType: {
    type: String,
    enum: ['Free', 'Free Tier', 'Student Plan', 'Paid', 'Campus Licence'],
    required: [true, 'Access type is required'],
  },
  accessInstructions: {
    type: String,
    trim: true,
    default: '',
  },
  logoUrl: {
    type: String,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  lastVerifiedDate: {
    type: Date,
    default: null,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tags: [{ type: String, trim: true }],
}, { timestamps: true });

softwareSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Software', softwareSchema);
