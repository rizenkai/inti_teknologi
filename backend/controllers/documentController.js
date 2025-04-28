const Document = require('../models/Document');
const path = require('path');

// Get all documents with pagination and filters
exports.getDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    // Apply filters if they exist
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    // For regular users, only show documents they can access
    if (req.user.role === 'user') {
      query.status = { $in: ['completed', 'approved'] };
    }

    const documents = await Document.find(query)
      .populate('uploadedBy', 'username fullname')
      .sort({ submissionDate: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocuments: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload document (Admin only)
exports.uploadDocument = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can upload documents' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { title, description, category, status } = req.body;
    const { filename, path: filePath, mimetype, size } = req.file;

    const document = await Document.create({
      title,
      description,
      fileName: filename,
      filePath,
      fileType: mimetype,
      fileSize: size,
      category,
      status,
      uploadedBy: req.user._id
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update document status (Staff and Admin only)
exports.updateDocumentStatus = async (req, res) => {
  try {
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update document status' });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Staff can only update status
    if (req.user.role === 'staff') {
      if (Object.keys(req.body).length > 1 || !req.body.status) {
        return res.status(403).json({ message: 'Staff can only update document status' });
      }
    }

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedDocument);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update document (Admin only)
exports.updateDocument = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can update documents' });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedDocument);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete document (Admin only)
exports.deleteDocument = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete documents' });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await document.remove();
    res.json({ message: 'Document removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Download document
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Regular users can only download completed/approved documents
    if (req.user.role === 'user' && !['completed', 'approved'].includes(document.status)) {
      return res.status(403).json({ 
        message: 'You can only download documents that are completed or approved' 
      });
    }

    // Owner can only view/download
    if (req.user.role === 'owner') {
      const file = path.join(__dirname, '..', document.filePath);
      return res.download(file);
    }

    const file = path.join(__dirname, '..', document.filePath);
    res.download(file);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
