const express = require('express');
const router = express.Router();
const Nutrition = require('../models/Nutrition');
const auth = require('../middleware/auth');

// Get all nutrition data for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { timeRange } = req.query;
    let query = { user: req.user.userId };

    // Filter by time range if specified
    if (timeRange) {
      const now = new Date();
      let startDate;

      switch (timeRange) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
      }

      query.date = { $gte: startDate };
    }

    const nutritionData = await Nutrition.find(query).sort({ date: -1 });
    res.json(nutritionData);
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent nutrition data
router.get('/recent', auth, async (req, res) => {
  try {
    const nutritionData = await Nutrition.find({ user: req.user.userId })
      .sort({ date: -1 })
      .limit(5);
    res.json(nutritionData);
  } catch (error) {
    console.error('Error fetching recent nutrition data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new nutrition log
router.post('/', auth, async (req, res) => {
  try {
    const nutrition = new Nutrition({
      ...req.body,
      user: req.user.userId
    });
    await nutrition.save();
    res.status(201).json(nutrition);
  } catch (error) {
    console.error('Error creating nutrition log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a nutrition log
router.put('/:id', auth, async (req, res) => {
  try {
    const nutrition = await Nutrition.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!nutrition) {
      return res.status(404).json({ message: 'Nutrition log not found' });
    }

    Object.assign(nutrition, req.body);
    await nutrition.save();
    res.json(nutrition);
  } catch (error) {
    console.error('Error updating nutrition log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a nutrition log
router.delete('/:id', auth, async (req, res) => {
  try {
    const nutrition = await Nutrition.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!nutrition) {
      return res.status(404).json({ message: 'Nutrition log not found' });
    }

    res.json({ message: 'Nutrition log deleted successfully' });
  } catch (error) {
    console.error('Error deleting nutrition log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 