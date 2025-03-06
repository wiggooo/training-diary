const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');

// Get all workouts for a user
router.get('/', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user._id })
      .sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new workout
router.post('/', auth, async (req, res) => {
  try {
    const workout = new Workout({
      ...req.body,
      userId: req.user._id
    });

    const newWorkout = await workout.save();
    res.status(201).json(newWorkout);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : []
    });
  }
});

// Delete a workout
router.delete('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    await workout.remove();
    res.json({ message: 'Workout deleted' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 