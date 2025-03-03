const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
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
  meals: [{
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true
    },
    foods: [{
      name: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number
    }],
    totalCalories: Number
  }],
  totalDailyCalories: {
    type: Number,
    required: true
  },
  waterIntake: {
    type: Number, // in ml
    required: true
  },
  notes: String
});

module.exports = mongoose.model('Nutrition', nutritionSchema); 