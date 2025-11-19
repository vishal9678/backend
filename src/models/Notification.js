const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info',
  },
  read: {
    type: Boolean,
    default: false,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  relatedType: {
    type: String,
    enum: ['pickup', 'item', 'agent', 'user'],
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);


