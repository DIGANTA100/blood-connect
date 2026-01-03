import express from 'express';
import BloodRequest from '../models/BloodRequest.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/requests
// @desc    Get all blood requests
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, bloodGroup, urgency } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (urgency) query.urgency = urgency;

    const requests = await BloodRequest.find(query)
      .populate('requestedBy', 'name email phone')
      .populate('fulfilledBy', 'name email phone')
      .sort({ urgency: -1, createdAt: -1 });
      
    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/requests/my-requests
// @desc    Get current user's requests
// @access  Private
router.get('/my-requests', authMiddleware, async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requestedBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/requests/:id
// @desc    Get single blood request
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requestedBy', 'name email phone')
      .populate('fulfilledBy', 'name email phone');
      
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/requests
// @desc    Create new blood request
// @access  Private (or Public with contact info)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const request = new BloodRequest({
      ...req.body,
      requestedBy: req.user?.id || null
    });
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/requests/:id/accept
// @desc    Accept/Fulfill a blood request
// @access  Private
router.post('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== 'OPEN') {
      return res.status(400).json({ message: 'Request is no longer open' });
    }
    
    request.status = 'FULFILLED';
    request.fulfilledBy = req.user.id;
    await request.save();
    
    res.json({ message: 'Request accepted successfully', request });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/requests/:id
// @desc    Update blood request
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Only allow owner to update
    if (request.requestedBy && request.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    Object.assign(request, req.body);
    await request.save();
    
    res.json(request);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Delete blood request
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Only allow owner to delete
    if (request.requestedBy && request.requestedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await request.deleteOne();
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;