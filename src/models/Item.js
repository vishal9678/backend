const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Item title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Item description is required'],
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  images: [{
    type: String,
  }],
  action: {
    type: String,
    enum: ['sell', 'donate', 'scrap'],
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'picked'],
    default: 'available',
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [Number],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Item', itemSchema);

