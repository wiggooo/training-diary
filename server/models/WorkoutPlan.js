const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true
  },
  targetMuscles: [{
    type: String,
    enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'fullBody']
  }],
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  exercises: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    sets: [{
      setNumber: {
        type: Number,
        required: true
      },
      weight: {
        type: Number,
        required: true
      },
      weightUnit: {
        type: String,
        enum: ['kg', 'lbs', 'bw'], // bw for bodyweight
        default: 'kg'
      },
      reps: {
        type: Number,
        required: true
      },
      isPersonalRecord: {
        type: Boolean,
        default: false
      },
      notes: {
        type: String,
        trim: true
      }
    }],
    restBetweenSets: {
      type: Number, // in seconds
      default: 90
    },
    notes: {
      type: String,
      trim: true
    },
    muscleGroups: [{
      type: String,
      enum: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core']
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  timesCompleted: {
    type: Number,
    default: 0
  }
});

// Middleware to update lastModified
workoutPlanSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Virtual for total sets
workoutPlanSchema.virtual('totalSets').get(function() {
  return this.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
});

// Virtual for total reps
workoutPlanSchema.virtual('totalReps').get(function() {
  return this.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((setTotal, set) => setTotal + set.reps, 0);
  }, 0);
});

// Index for faster queries
workoutPlanSchema.index({ userId: 1, name: 1 });
workoutPlanSchema.index({ targetMuscles: 1 });

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema); 