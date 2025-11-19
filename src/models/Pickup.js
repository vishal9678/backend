const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'on_the_way', 'picked', 'completed'],
    default: 'pending',
  },
  scheduledDate: {
    type: Date,
  },
  completedDate: {
    type: Date,
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Pickup', pickupSchema);


