const express = require('express');
const router = express.Router();
const SavedFood = require('../models/SavedFood');
const auth = require('../middleware/auth');

// Get all saved foods for a user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching saved foods for user:', req.user._id);
    const savedFoods = await SavedFood.find({ userId: req.user._id })
      .sort({ name: 1 });
    res.json(savedFoods);
  } catch (error) {
    console.error('Error fetching saved foods:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new saved food
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating new saved food:', req.body);
    const savedFood = new SavedFood({
      ...req.body,
      userId: req.user._id
    });

    const newSavedFood = await savedFood.save();
    console.log('Saved food created successfully:', newSavedFood);
    res.status(201).json(newSavedFood);
  } catch (error) {
    console.error('Error creating saved food:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : []
    });
  }
});

// Delete a saved food
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Attempting to delete saved food:', req.params.id);
    const result = await SavedFood.deleteOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (result.deletedCount === 0) {
      console.log('Saved food not found:', req.params.id);
      return res.status(404).json({ message: 'Saved food not found' });
    }

    console.log('Saved food deleted successfully:', req.params.id);
    res.json({ message: 'Saved food deleted' });
  } catch (error) {
    console.error('Error deleting saved food:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 