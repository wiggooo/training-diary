const express = require('express');
const router = express.Router();
const WorkoutPlan = require('../models/WorkoutPlan');
const auth = require('../middleware/auth');

// Get all workout plans for a user
router.get('/', auth, async (req, res) => {
  try {
    const workoutPlans = await WorkoutPlan.find({ userId: req.user._id })
      .sort({ lastModified: -1 });
    res.json(workoutPlans);
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific workout plan
router.get('/:id', auth, async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    res.json(workoutPlan);
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new workout plan
router.post('/', auth, async (req, res) => {
  try {
    const workoutPlan = new WorkoutPlan({
      ...req.body,
      userId: req.user._id
    });

    const savedPlan = await workoutPlan.save();
    res.status(201).json(savedPlan);
  } catch (error) {
    console.error('Error creating workout plan:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : []
    });
  }
});

// Update a workout plan
router.put('/:id', auth, async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      workoutPlan[key] = req.body[key];
    });

    const updatedPlan = await workoutPlan.save();
    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating workout plan:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : []
    });
  }
});

// Delete a workout plan
router.delete('/:id', auth, async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    await workoutPlan.remove();
    res.json({ message: 'Workout plan deleted' });
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark workout plan as completed
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    workoutPlan.timesCompleted += 1;
    await workoutPlan.save();

    res.json({ message: 'Workout plan marked as completed', timesCompleted: workoutPlan.timesCompleted });
  } catch (error) {
    console.error('Error completing workout plan:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 