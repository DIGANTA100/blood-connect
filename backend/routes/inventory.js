import express from 'express';
import BloodInventory from '../models/BloodInventory.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/inventory/hospitals
// @desc    Get all hospitals with complete blood stock
// @access  Public
router.get('/hospitals', async (req, res) => {
  try {
    const inventory = await BloodInventory.find().sort({ hospitalName: 1 });
    
    // Group by hospital
    const hospitalsMap = new Map();
    
    inventory.forEach(item => {
      const key = item.hospitalId || item.hospitalName;
      
      if (!hospitalsMap.has(key)) {
        hospitalsMap.set(key, {
          id: item.hospitalId || item._id.toString(),
          name: item.hospitalName,
          type: item.hospitalType,
          city: item.city,
          division: item.division,
          phone: item.phone,
          email: item.email,
          is247: item.is247,
          bloodStock: {
            'A+': { quantity: 0, status: 'CRITICAL', expiryDate: new Date().toISOString() },
            'A-': { quantity: 0, status: 'CRITICAL', expiryDate: new Date().toISOString() },
            'B+': { quantity: 0, status: 'CRITICAL', expiryDate: new Date().toISOString() },
            'B-': { quantity: 0, status: 'CRITICAL', expiryDate: new Date().toISOString() },
            'AB+': { quantity: 0, status: 'CRITICAL', expiryDate: new Date().toISOString() },
            'AB-': { quantity: 0, status: 'CRITICAL', expiryDate: new Date().toISOString() },
            'O+': { quantity: 0, status: 'CRITICAL', expiryDate: new Date().toISOString() },
            'O-': { quantity: 0, status: 'CRITICAL', expiryDate: new Date().toISOString() }
          },
          lastUpdated: item.lastUpdated || item.updatedAt
        });
      }
      
      const hospital = hospitalsMap.get(key);
      hospital.bloodStock[item.bloodType] = {
        quantity: item.quantity,
        status: item.status,
        expiryDate: item.expiryDate
      };
      
      // Update lastUpdated to most recent
      if (new Date(item.lastUpdated || item.updatedAt) > new Date(hospital.lastUpdated)) {
        hospital.lastUpdated = item.lastUpdated || item.updatedAt;
      }
    });
    
    res.json(Array.from(hospitalsMap.values()));
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/inventory/donate
// @desc    Record a blood donation
// @access  Private
router.post('/donate', authMiddleware, async (req, res) => {
  try {
    const { hospitalId, bloodGroup, donorId } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Find inventory for this hospital and blood group
    const inventory = await BloodInventory.findOne({
      $or: [
        { hospitalId: hospitalId },
        { hospitalName: { $regex: hospitalId, $options: 'i' } }
      ],
      bloodType: bloodGroup
    });
    
    if (inventory) {
      // Increase stock by 1 unit
      inventory.quantity += 1;
      await inventory.save();
    }
    
    // Update user's last donation date and points
    const user = await User.findById(req.user.id);
    if (user) {
      user.lastDonationDate = new Date().toISOString();
      user.points += 50;
      await user.save();
    }
    
    res.json({ 
      message: 'Donation recorded successfully',
      newStock: inventory?.quantity,
      pointsEarned: 50
    });
  } catch (error) {
    console.error('Donate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/inventory
// @desc    Get all blood inventory
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, bloodType, status } = req.query;
    
    let query = {};
    if (city) query.city = city;
    if (bloodType) query.bloodType = bloodType;
    if (status) query.status = status;

    const inventory = await BloodInventory.find(query).sort({ updatedAt: -1 });
    res.json(inventory);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/inventory/critical
// @desc    Get critical shortages count
// @access  Public
router.get('/critical', async (req, res) => {
  try {
    const count = await BloodInventory.countDocuments({ status: 'CRITICAL' });
    res.json({ count });
  } catch (error) {
    console.error('Get critical count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/inventory
// @desc    Add new blood inventory
// @access  Private (Admin only - implement auth middleware later)
router.post('/', async (req, res) => {
  try {
    const inventory = new BloodInventory(req.body);
    await inventory.save();
    res.status(201).json(inventory);
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update blood inventory
// @access  Private (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const inventory = await BloodInventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    
    res.json(inventory);
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete blood inventory
// @access  Private (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const inventory = await BloodInventory.findByIdAndDelete(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    
    res.json({ message: 'Inventory deleted successfully' });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;