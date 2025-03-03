const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    required: true,
    enum: ['gym', 'cardio', 'sports', 'other']
  },
  bodyParts: [{
    type: String,
    enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'full-body']
  }],
  duration: {
    type: Number, // in minutes
    required: true
  },
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
    weight: Number
  }],
  notes: String
});

module.exports = mongoose.model('Workout', workoutSchema); 