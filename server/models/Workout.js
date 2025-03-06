const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['strength', 'cardio', 'flexibility', 'other']
  },
  exercises: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    sets: [{
      reps: {
        type: Number,
        required: true,
        min: 0
      },
      weight: {
        type: Number,
        required: true,
        min: 0
      }
    }],
    duration: {
      type: Number,
      min: 0
    },
    distance: {
      type: Number,
      min: 0
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
workoutSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Workout', workoutSchema); 