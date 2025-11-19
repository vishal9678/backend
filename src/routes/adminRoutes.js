const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllAgents,
  verifyAgent,
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getAnalytics,
  getAllNotifications,
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Users
router.get('/users', authMiddleware, roleMiddleware('admin'), getAllUsers);

// Agents
router.get('/agents', authMiddleware, roleMiddleware('admin'), getAllAgents);
router.put('/agents/:agentId/verify', authMiddleware, roleMiddleware('admin'), verifyAgent);

// Categories
router.post('/categories', authMiddleware, roleMiddleware('admin'), createCategory);
router.get('/categories', getAllCategories);
router.put('/categories/:id', authMiddleware, roleMiddleware('admin'), updateCategory);
router.delete('/categories/:id', authMiddleware, roleMiddleware('admin'), deleteCategory);

// Analytics
router.get('/analytics', authMiddleware, roleMiddleware('admin'), getAnalytics);

// Notifications
router.get('/notifications', authMiddleware, roleMiddleware('admin'), getAllNotifications);

module.exports = router;

