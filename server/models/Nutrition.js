const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  meals: [{
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
    }
  }],
  waterIntake: {
    type: Number,
    default: 0,
    min: 0,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
nutritionSchema.index({ userId: 1, date: -1 });

// Calculate total daily calories
nutritionSchema.virtual('totalDailyCalories').get(function() {
  return this.meals.reduce((total, meal) => total + meal.calories, 0);
});

module.exports = mongoose.model('Nutrition', nutritionSchema); 