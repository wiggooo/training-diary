const express = require('express');
const router = express.Router();
const Nutrition = require('../models/Nutrition');
const auth = require('../middleware/auth');

// Get all nutrition logs for a user
router.get('/', auth, async (req, res) => {
  try {
    const nutritionLogs = await Nutrition.find({ userId: req.user._id })
      .sort({ date: -1 });
    res.json(nutritionLogs);
  } catch (error) {
    console.error('Error fetching nutrition logs:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new nutrition log
router.post('/', auth, async (req, res) => {
  try {
    const { date, meals, waterIntake } = req.body;
    
    // Find existing nutrition log for the date
    let nutritionLog = await Nutrition.findOne({
      userId: req.user._id,
      date: new Date(date).toISOString().split('T')[0]
    });

    if (nutritionLog) {
      // Update existing log
      nutritionLog.meals = [...nutritionLog.meals, ...meals];
      if (waterIntake !== undefined) {
        nutritionLog.waterIntake = waterIntake;
      }
    } else {
      // Create new log
      nutritionLog = new Nutrition({
        userId: req.user._id,
        date: new Date(date).toISOString().split('T')[0],
        meals,
        waterIntake: waterIntake || 0
      });
    }

    const savedLog = await nutritionLog.save();
    res.status(201).json(savedLog);
  } catch (error) {
    console.error('Error creating nutrition log:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : []
    });
  }
});

// Delete a meal from a nutrition log
router.delete('/:id/meals/:mealIndex', auth, async (req, res) => {
  try {
    const nutritionLog = await Nutrition.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!nutritionLog) {
      return res.status(404).json({ message: 'Nutrition log not found' });
    }

    const mealIndex = parseInt(req.params.mealIndex);
    if (mealIndex < 0 || mealIndex >= nutritionLog.meals.length) {
      return res.status(400).json({ message: 'Invalid meal index' });
    }

    // Remove the meal at the specified index
    nutritionLog.meals.splice(mealIndex, 1);
    await nutritionLog.save();

    res.json({ message: 'Meal deleted' });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete an entire nutrition log
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Nutrition.deleteOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Nutrition log not found' });
    }

    res.json({ message: 'Nutrition log deleted' });
  } catch (error) {
    console.error('Error deleting nutrition log:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 