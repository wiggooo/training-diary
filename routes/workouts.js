const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');

// Get all workouts for the authenticated user
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

    const workouts = await Workout.find(query).sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent workouts
router.get('/recent', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.userId })
      .sort({ date: -1 })
      .limit(5);
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching recent workouts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new workout
router.post('/', auth, async (req, res) => {
  try {
    const workout = new Workout({
      ...req.body,
      user: req.user.userId
    });
    await workout.save();
    res.status(201).json(workout);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a workout
router.put('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    Object.assign(workout, req.body);
    await workout.save();
    res.json(workout);
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a workout
router.delete('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 