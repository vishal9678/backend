const User = require('../models/User');
const Agent = require('../models/Agent');
const Category = require('../models/Category');
const Pickup = require('../models/Pickup');
const Item = require('../models/Item');
const Notification = require('../models/Notification');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get all agents
const getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find()
      .populate('userId', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { agents },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Verify agent
const verifyAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { verificationStatus } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status',
      });
    }

    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
    }

    agent.verificationStatus = verificationStatus;
    await agent.save();

    // Create notification
    await Notification.create({
      userId: agent.userId,
      message: `Your agent verification status has been updated to ${verificationStatus}`,
      type: verificationStatus === 'verified' ? 'success' : 'info',
      relatedId: agent._id,
      relatedType: 'agent',
    });

    res.json({
      success: true,
      message: 'Agent verification status updated',
      data: { agent },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const category = await Category.create({ name, icon, description });
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    let categories = await Category.find().sort({ name: 1 });
    
    // If no categories exist, create default ones
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'E-waste', icon: '📱', description: 'Electronic devices and gadgets' },
        { name: 'Plastic', icon: '♻️', description: 'Plastic items and containers' },
        { name: 'Clothes', icon: '👕', description: 'Clothing and textiles' },
        { name: 'Metal', icon: '🔩', description: 'Metal items and scrap' },
        { name: 'Furniture', icon: '🪑', description: 'Furniture and home items' },
        { name: 'Glass', icon: '🥃', description: 'Glass items and containers' },
        { name: 'Paper', icon: '📄', description: 'Paper and cardboard' },
        { name: 'Other', icon: '📦', description: 'Other miscellaneous items' },
      ];
      
      categories = await Category.insertMany(defaultCategories);
    }
    
    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, description } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, icon, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get analytics
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAgents = await Agent.countDocuments();
    const totalItems = await Item.countDocuments();
    const totalPickups = await Pickup.countDocuments();
    const completedPickups = await Pickup.countDocuments({ status: 'completed' });
    const pendingPickups = await Pickup.countDocuments({ status: 'pending' });

    const categoryStats = await Item.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAgents,
        totalItems,
        totalPickups,
        completedPickups,
        pendingPickups,
        categoryStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: { notifications },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

module.exports = {
  getAllUsers,
  getAllAgents,
  verifyAgent,
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getAnalytics,
  getAllNotifications,
};

