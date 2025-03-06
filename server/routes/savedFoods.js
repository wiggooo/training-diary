const express = require('express');
const router = express.Router();
const SavedFood = require('../models/SavedFood');
const auth = require('../middleware/auth');

// Get all saved foods for a user
router.get('/', auth, async (req, res) => {
  try {
    const savedFoods = await SavedFood.find({ userId: req.user._id })
      .sort({ name: 1 });
    res.json(savedFoods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new saved food
router.post('/', auth, async (req, res) => {
  const savedFood = new SavedFood({
    ...req.body,
    userId: req.user._id
  });

  try {
    const newSavedFood = await savedFood.save();
    res.status(201).json(newSavedFood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a saved food
router.delete('/:id', auth, async (req, res) => {
  try {
    const savedFood = await SavedFood.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!savedFood) {
      return res.status(404).json({ message: 'Saved food not found' });
    }

    await savedFood.remove();
    res.json({ message: 'Saved food deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 