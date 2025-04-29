const express = require('express');
const router = express.Router();
const { 
  getDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  updateDocumentStatus,
  createDocumentManual
} = require('../controllers/documentController');
const { addNewDocument } = require('../controllers/newDocumentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getDocuments);
router.post('/', protect, authorize('admin'), uploadDocument);
router.post('/manual', protect, authorize('admin'), createDocumentManual);
router.post('/new', protect, authorize('admin'), addNewDocument);
router.put('/:id', protect, authorize('admin'), updateDocument);
router.delete('/:id', protect, authorize('admin'), deleteDocument);
router.get('/:id/download', protect, downloadDocument);
router.patch('/:id/status', protect, authorize('admin', 'staff'), updateDocumentStatus);

module.exports = router;
