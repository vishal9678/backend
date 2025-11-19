const Item = require('../models/Item');
const Pickup = require('../models/Pickup');
const path = require('path');

// Create new item
const createItem = async (req, res) => {
  try {
    const { title, description, category, action } = req.body;

    if (!title || !description || !category || !action) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const item = await Item.create({
      userId: req.user.id,
      title,
      description,
      category,
      images,
      action,
    });

    // Create pickup request
    const pickup = await Pickup.create({
      itemId: item._id,
      userId: req.user.id,
      status: 'pending',
    });

    // Emit real-time update for agents
    const io = req.app.get('io');
    if (io) {
      io.emit('new-pickup-available', {
        pickupId: pickup._id,
        itemId: item._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: { item, pickup },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get user's items
const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ userId: req.user.id })
      .populate('category', 'name icon')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { items },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get all items (for agents/admin)
const getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate('userId', 'name email phone')
      .populate('category', 'name icon')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { items },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Get single item
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('userId', 'name email phone address')
      .populate('category', 'name icon description');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.json({
      success: true,
      data: { item },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Check ownership or admin
    if (item.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item',
      });
    }

    await Item.findByIdAndDelete(req.params.id);
    await Pickup.deleteMany({ itemId: req.params.id });

    res.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

module.exports = {
  createItem,
  getMyItems,
  getAllItems,
  getItem,
  deleteItem,
};

