const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DiaryEntry = require('../models/DiaryEntry');

// Get all diary entries
router.get('/', auth, async (req, res) => {
  try {
    const entries = await DiaryEntry.find()
      .populate('headingId', 'title')
      .sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Error fetching diary entries:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a diary entry
router.post('/', auth, async (req, res) => {
  try {
    const { title = '', content = '', headingId = null, date = new Date() } = req.body;
    const entry = new DiaryEntry({
      title,
      content,
      headingId,
      date: date ? new Date(date) : new Date(),
      completed: false,
    });
    await entry.save();
    const populatedEntry = await entry.populate('headingId', 'title');
    res.json(populatedEntry);
  } catch (err) {
    console.error('Error creating diary entry:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a diary entry
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, headingId, date, completed } = req.body;
    const updateData = {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(headingId !== undefined && { headingId }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(completed !== undefined && { completed }),
    };

    const entry = await DiaryEntry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('headingId', 'title');
    
    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }
    res.json(entry);
  } catch (err) {
    console.error('Error updating diary entry:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle completion status
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }
    
    entry.completed = !entry.completed;
    await entry.save();
    
    const updatedEntry = await entry.populate('headingId', 'title');
    res.json(updatedEntry);
  } catch (err) {
    console.error('Error toggling diary entry completion:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a diary entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await DiaryEntry.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }
    res.json({ message: 'Diary entry deleted successfully' });
  } catch (err) {
    console.error('Error deleting diary entry:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
