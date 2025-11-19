const express = require('express');
const router = express.Router();
const {
  createItem,
  getMyItems,
  getAllItems,
  getItem,
  deleteItem,
} = require('../controllers/itemController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../utils/upload');

router.post('/', authMiddleware, upload.array('images', 5), createItem);
router.get('/my-items', authMiddleware, getMyItems);
router.get('/all', authMiddleware, roleMiddleware('agent', 'admin'), getAllItems);
router.get('/:id', authMiddleware, getItem);
router.delete('/:id', authMiddleware, deleteItem);

module.exports = router;


