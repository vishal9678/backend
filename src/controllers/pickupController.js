const Pickup = require('../models/Pickup');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const Agent = require('../models/Agent');

// Get user's pickups
const getMyPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({ userId: req.user.id })
      .populate('itemId', 'title description images category action')
      .populate('agentId', 'userId')
      .populate({
        path: 'agentId',
        populate: {
          path: 'userId',
          select: 'name email phone',
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { pickups },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get agent's assigned pickups
const getAgentPickups = async (req, res) => {
  try {
    const agent = await Agent.findOne({ userId: req.user.id });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found',
      });
    }

    const pickups = await Pickup.find({ agentId: agent._id })
      .populate('itemId', 'title description images category action')
      .populate('userId', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { pickups },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get all pending pickups (for agents)
const getPendingPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({ status: 'pending', agentId: null })
      .populate('itemId', 'title description images category action')
      .populate('userId', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { pickups },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Accept pickup (agent)
const acceptPickup = async (req, res) => {
  try {
    const { pickupId } = req.params;
    const agent = await Agent.findOne({ userId: req.user.id });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found',
      });
    }

    const pickup = await Pickup.findById(pickupId);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found',
      });
    }

    if (pickup.agentId) {
      return res.status(400).json({
        success: false,
        message: 'Pickup already assigned to another agent',
      });
    }

    pickup.agentId = agent._id;
    pickup.status = 'accepted';
    await pickup.save();

    // Create notification
    await Notification.create({
      userId: pickup.userId,
      message: 'An agent has accepted your pickup request',
      type: 'success',
      relatedId: pickup._id,
      relatedType: 'pickup',
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${pickup.userId}`).emit('pickup-updated', {
        pickupId: pickup._id,
        status: pickup.status,
        agentId: pickup.agentId,
      });
    }

    res.json({
      success: true,
      message: 'Pickup accepted successfully',
      data: { pickup },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Update pickup status (agent)
const updatePickupStatus = async (req, res) => {
  try {
    const { pickupId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'accepted', 'on_the_way', 'picked', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const pickup = await Pickup.findById(pickupId);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found',
      });
    }

    // Check if agent owns this pickup
    const agent = await Agent.findOne({ userId: req.user.id });
    if (pickup.agentId?.toString() !== agent?._id?.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this pickup',
      });
    }

    pickup.status = status;
    if (status === 'completed') {
      pickup.completedDate = new Date();
      await Item.findByIdAndUpdate(pickup.itemId, { status: 'picked' });
      
      // Update agent stats
      if (agent) {
        agent.totalPickups += 1;
        await agent.save();
      }
    }

    await pickup.save();

    // Create notification
    const statusMessages = {
      accepted: 'Your pickup has been accepted',
      on_the_way: 'Agent is on the way to pick up your item',
      picked: 'Your item has been picked up',
      completed: 'Pickup completed successfully',
    };

    if (statusMessages[status]) {
      await Notification.create({
        userId: pickup.userId,
        message: statusMessages[status],
        type: 'success',
        relatedId: pickup._id,
        relatedType: 'pickup',
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${pickup.userId}`).emit('pickup-updated', {
        pickupId: pickup._id,
        status: pickup.status,
      });
      // Also broadcast to admin room
      io.emit('admin-pickup-updated', {
        pickupId: pickup._id,
        status: pickup.status,
      });
    }

    res.json({
      success: true,
      message: 'Pickup status updated',
      data: { pickup },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get all pickups (admin)
const getAllPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find()
      .populate('itemId', 'title description images category action')
      .populate('userId', 'name email phone')
      .populate({
        path: 'agentId',
        populate: {
          path: 'userId',
          select: 'name email phone',
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { pickups },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

module.exports = {
  getMyPickups,
  getAgentPickups,
  getPendingPickups,
  acceptPickup,
  updatePickupStatus,
  getAllPickups,
};

