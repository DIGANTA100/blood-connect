import express from 'express';
import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import BloodInventory from '../models/BloodInventory.js';

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: 'DONOR' });
    const recentRequestsCount = await BloodRequest.countDocuments({ 
      status: 'OPEN',
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Calculate lives saved (each donation can save up to 3 lives)
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'FULFILLED' });
    const livesSaved = fulfilledRequests * 3;

    res.json({
      totalDonors,
      livesSaved,
      recentRequestsCount,
      points: 0 // This will be user-specific from frontend
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/trends
// @desc    Get donation trends (last 6 months)
// @access  Public
router.get('/trends', async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await BloodRequest.aggregate([
      {
        $match: {
          status: 'FULFILLED',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // If no data, return mock data for last 6 months
    if (trends.length === 0) {
      const mockTrends = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentDate = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        mockTrends.push({
          month: monthNames[date.getMonth()],
          count: Math.floor(Math.random() * 500) + 300
        });
      }
      return res.json(mockTrends);
    }

    // Format the response
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrends = trends.map(item => ({
      month: monthNames[item._id.month - 1],
      count: item.count
    }));

    res.json(formattedTrends);
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/inventory
// @desc    Get blood inventory summary by group
// @access  Public
router.get('/inventory', async (req, res) => {
  try {
    const inventory = await BloodInventory.aggregate([
      {
        $group: {
          _id: '$bloodType',
          value: { $sum: '$quantity' }
        }
      },
      {
        $project: {
          _id: 0,
          group: '$_id',
          value: 1
        }
      },
      {
        $sort: { group: 1 }
      }
    ]);

    res.json(inventory);
  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;