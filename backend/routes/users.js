const express = require('express');
const router = express.Router();
const { 
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and only accessible by admin
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.post('/', protect, authorize('admin'), createUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
