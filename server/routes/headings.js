const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Heading = require('../models/Heading');
const Website = require('../models/Website');

// Get all headings
router.get('/', auth, async (req, res) => {
  try {
    const headings = await Heading.find().sort({ title: 1 });
    res.json(headings);
  } catch (err) {
    console.error('Error fetching headings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a heading
router.post('/', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    const heading = new Heading({ title, description });
    await heading.save();
    res.status(201).json(heading);
  } catch (err) {
    console.error('Error creating heading:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a heading
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    const heading = await Heading.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );
    if (!heading) {
      return res.status(404).json({ message: 'Heading not found' });
    }
    res.json(heading);
  } catch (err) {
    console.error('Error updating heading:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a heading
router.delete('/:id', auth, async (req, res) => {
  try {
    // First check if there are any websites using this heading
    const websites = await Website.find({ headingId: req.params.id });
    if (websites.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete heading with associated websites. Please delete or move the websites first.' 
      });
    }

    const heading = await Heading.findByIdAndDelete(req.params.id);
    if (!heading) {
      return res.status(404).json({ message: 'Heading not found' });
    }
    res.json({ message: 'Heading deleted successfully' });
  } catch (err) {
    console.error('Error deleting heading:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
