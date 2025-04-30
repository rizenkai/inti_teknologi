const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // Campos adicionales para documentos de materiales
  bp: {
    type: Number, // Double para BP (Kg)
    default: null
  },
  kodeBahan: {
    type: String, // Varchar para Kode Bahan
    trim: true,
    default: ''
  },
  tipeBahan: {
    type: String, // Enum para Tipe Bahan
    enum: ['Silinder', 'Kubus', 'Balok', 'Paving', 'Scoup', ''],
    default: ''
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'review', 'completed', 'approved', 'rejected'],
    default: 'pending'
  },
  category: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

// Update lastModified on save
documentSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model('Document', documentSchema);
