const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  assignedAreas: [{
    type: String,
    trim: true,
  }],
  totalPickups: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Agent', agentSchema);


