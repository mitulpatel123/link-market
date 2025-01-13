const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Website = require('../models/Website');

// Get all websites
router.get('/', auth, async (req, res) => {
  try {
    const websites = await Website.find().sort({ name: 1 });
    res.json(websites);
  } catch (err) {
    console.error('Error fetching websites:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a website
router.post('/', auth, async (req, res) => {
  try {
    const { name, url, headingId } = req.body;
    const website = new Website({ name, url, headingId });
    await website.save();
    res.json(website);
  } catch (err) {
    console.error('Error creating website:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a website
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, url, headingId } = req.body;
    const website = await Website.findByIdAndUpdate(
      req.params.id,
      { name, url, headingId },
      { new: true }
    );
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }
    res.json(website);
  } catch (err) {
    console.error('Error updating website:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a website
router.delete('/:id', auth, async (req, res) => {
  try {
    const website = await Website.findByIdAndDelete(req.params.id);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }
    res.json({ message: 'Website deleted successfully' });
  } catch (err) {
    console.error('Error deleting website:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
