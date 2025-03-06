const mongoose = require('mongoose');

const savedFoodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein: {
    type: Number,
    required: true,
    min: 0
  },
  carbs: {
    type: Number,
    required: true,
    min: 0
  },
  fat: {
    type: Number,
    required: true,
    min: 0
  },
  servingSize: {
    type: Number,
    required: true,
    min: 0
  },
  servingUnit: {
    type: String,
    required: true,
    enum: ['g', 'ml', 'piece', 'portion']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster searches
savedFoodSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('SavedFood', savedFoodSchema); 