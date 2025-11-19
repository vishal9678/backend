const express = require('express');
const router = express.Router();
const {
  getMyPickups,
  getAgentPickups,
  getPendingPickups,
  acceptPickup,
  updatePickupStatus,
  getAllPickups,
} = require('../controllers/pickupController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/my-pickups', authMiddleware, getMyPickups);
router.get('/agent-pickups', authMiddleware, roleMiddleware('agent'), getAgentPickups);
router.get('/pending', authMiddleware, roleMiddleware('agent'), getPendingPickups);
router.post('/:pickupId/accept', authMiddleware, roleMiddleware('agent'), acceptPickup);
router.put('/:pickupId/status', authMiddleware, roleMiddleware('agent', 'admin'), updatePickupStatus);
router.get('/all', authMiddleware, roleMiddleware('admin'), getAllPickups);

module.exports = router;


