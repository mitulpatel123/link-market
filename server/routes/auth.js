const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
require('dotenv').config();

// Update main PIN
router.post('/update-pin', async (req, res) => {
  const { newPin } = req.body;
  
  try {
    // Update the PIN in environment
    process.env.ACCESS_CODE = newPin;
    
    // Create new JWT token with the new PIN
    const token = jwt.sign(
      { accessCode: newPin },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '24h' }
    );

    // When sending tokens, use secure cookies in production
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };

    res.cookie('token', token, cookieOptions);
    res.json({ token, message: 'PIN updated successfully' });
  } catch (err) {
    console.error('Update PIN error:', err);
    res.status(500).json({ message: 'Failed to update PIN' });
  }
});

// Update diary PIN
router.post('/update-diary-pin', async (req, res) => {
  const { currentPin, newPin } = req.body;
  
  try {
    // Get current diary PIN or use default
    const storedDiaryPin = process.env.DIARY_PIN || '312002';

    // Verify current PIN
    if (String(currentPin) !== String(storedDiaryPin)) {
      return res.status(401).json({ message: 'Current diary PIN is incorrect' });
    }

    // Update the diary PIN in environment
    process.env.DIARY_PIN = newPin;
    
    // Create new diary token
    const diaryToken = jwt.sign(
      { diaryPin: newPin },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '24h' }
    );

    // When sending tokens, use secure cookies in production
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };

    res.cookie('token', diaryToken, cookieOptions);
    res.json({ diaryToken, message: 'Diary PIN updated successfully' });
  } catch (err) {
    console.error('Update diary PIN error:', err);
    res.status(500).json({ message: 'Failed to update diary PIN' });
  }
});

// Verify diary PIN
router.post('/verify-diary-pin', async (req, res) => {
  const { pin } = req.body;
  
  try {
    // Get stored diary PIN or use default
    const storedDiaryPin = process.env.DIARY_PIN || '312002';

    // Check if PIN matches
    if (String(pin) !== String(storedDiaryPin)) {
      return res.status(401).json({ message: 'Invalid diary PIN' });
    }

    // Create diary token
    const diaryToken = jwt.sign(
      { diaryPin: pin },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '24h' }
    );

    // When sending tokens, use secure cookies in production
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };

    res.cookie('token', diaryToken, cookieOptions);
    res.json({ diaryToken, message: 'Diary access granted' });
  } catch (err) {
    console.error('Diary auth error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify access code
router.post('/verify-code', async (req, res) => {
  const { code } = req.body;

  try {
    // Get the stored PIN or use default
    const storedPin = process.env.ACCESS_CODE || '654321';

    // Convert both to strings for comparison
    const codeStr = String(code);
    const pinStr = String(storedPin);

    console.log('PIN verification attempt');
    
    // Check if code matches
    if (codeStr !== pinStr) {
      return res.status(401).json({ message: 'Invalid access code' });
    }

    // Create JWT token
    const token = jwt.sign(
      { accessCode: code },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '24h' }
    );

    // When sending tokens, use secure cookies in production
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };

    res.cookie('token', token, cookieOptions);
    res.json({ token, message: 'Authentication successful' });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change Main PIN
router.post('/change-main-pin', auth, async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;
    
    // Get stored PIN or use default
    const storedPin = process.env.ACCESS_CODE || '654321';

    // Verify current PIN
    if (String(currentPin) !== String(storedPin)) {
      return res.status(400).json({ message: 'Current PIN is incorrect' });
    }

    // Update the PIN in environment
    process.env.ACCESS_CODE = newPin;

    // Create new JWT token with the new PIN
    const token = jwt.sign(
      { accessCode: newPin },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '24h' }
    );

    // When sending tokens, use secure cookies in production
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };

    res.cookie('token', token, cookieOptions);
    res.json({ token, message: 'Main PIN updated successfully' });
  } catch (err) {
    console.error('Error changing main PIN:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change Diary PIN
router.post('/change-diary-pin', auth, async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;
    
    // Get current diary PIN or use default
    const storedDiaryPin = process.env.DIARY_PIN || '312002';

    // Verify current PIN
    if (String(currentPin) !== String(storedDiaryPin)) {
      return res.status(400).json({ message: 'Current diary PIN is incorrect' });
    }

    // Update the diary PIN in environment
    process.env.DIARY_PIN = newPin;
    
    // Create new diary token
    const diaryToken = jwt.sign(
      { diaryPin: newPin },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '24h' }
    );

    // When sending tokens, use secure cookies in production
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };

    res.cookie('token', diaryToken, cookieOptions);
    res.json({ diaryToken, message: 'Diary PIN updated successfully' });
  } catch (err) {
    console.error('Error changing diary PIN:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
