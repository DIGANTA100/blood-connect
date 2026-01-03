import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (donors)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { bloodGroup, district, isAvailable } = req.query;
    
    let query = { role: 'DONOR' };
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (district) query.district = district;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    // Don't allow password update through this route
    delete req.body.password;
    delete req.body.email; // Email should not be changed
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/points
// @desc    Update user points
// @access  Private
router.put('/:id/points', async (req, res) => {
  try {
    const { points } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $inc: { points: points } },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Update points error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;