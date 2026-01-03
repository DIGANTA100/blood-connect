import express from 'express';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import BloodInventory from '../models/BloodInventory.js';
import { authMiddleware, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(requireAuth);

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { 
      hospitalId, 
      hospitalName, 
      hospitalAddress, 
      hospitalPhone, 
      bloodGroup, 
      appointmentDate, 
      appointmentTime,
      notes 
    } = req.body;

    // Validate required fields
    if (!hospitalName || !bloodGroup || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ 
        message: 'Missing required fields: hospitalName, bloodGroup, appointmentDate, appointmentTime' 
      });
    }

    // Get donor info
    const donor = await User.findById(req.user.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    // Check if appointment date is in the future
    const apptDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (apptDate < today) {
      return res.status(400).json({ message: 'Appointment date must be in the future' });
    }

    // Check if donor has donated in last 120 days
    if (donor.lastDonationDate) {
      const daysSinceLastDonation = Math.floor(
        (Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastDonation < 120) {
        return res.status(400).json({ 
          message: `You must wait ${120 - daysSinceLastDonation} more days before donating again`,
          daysRemaining: 120 - daysSinceLastDonation
        });
      }
    }

    // Generate hospitalId if not provided
    const finalHospitalId = hospitalId || `hospital-${hospitalName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    // Create appointment
    const appointment = new Appointment({
      donor: req.user.id,
      donorName: donor.name,
      donorPhone: donor.phone,
      donorBloodGroup: donor.bloodGroup,
      hospitalId: finalHospitalId,
      hospitalName,
      hospitalAddress: hospitalAddress || 'N/A',
      hospitalPhone: hospitalPhone || 'N/A',
      bloodGroup,
      appointmentDate: apptDate,
      appointmentTime,
      notes: notes || '',
      status: 'SCHEDULED'
    });

    await appointment.save();

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   GET /api/appointments/my-appointments
// @desc    Get current user's appointments
// @access  Private
router.get('/my-appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find({ donor: req.user.id })
      .sort({ appointmentDate: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if appointment belongs to user
    if (appointment.donor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id/complete
// @desc    Mark appointment as completed and update inventory (AUTO-CREATE MISSING RECORDS)
// @access  Private
router.put('/:id/complete', async (req, res) => {
  try {
    console.log('🚀 Starting appointment completion...');
    
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.donor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (appointment.status !== 'SCHEDULED') {
      return res.status(400).json({ message: 'Appointment already processed' });
    }

    // Update appointment status
    appointment.status = 'COMPLETED';
    appointment.completedAt = new Date();
    await appointment.save();
    console.log('✅ Appointment marked as COMPLETED');

    // Search for inventory record
    console.log('🔍 Searching for inventory:', {
      hospitalName: appointment.hospitalName,
      bloodType: appointment.bloodGroup
    });

    let inventory = await BloodInventory.findOne({
      hospitalName: appointment.hospitalName,
      bloodType: appointment.bloodGroup
    });

    if (inventory) {
      // Record exists - just increment
      const oldQuantity = inventory.quantity;
      inventory.quantity += 1;
      await inventory.save();
      
      console.log('✅ Inventory updated:', {
        hospital: inventory.hospitalName,
        bloodType: inventory.bloodType,
        oldQuantity: oldQuantity,
        newQuantity: inventory.quantity
      });
    } else {
      // Record doesn't exist - create it!
      console.log('⚠️ Inventory record not found. Creating new record...');
      
      // Get hospital info from an existing record of the same hospital (any blood type)
      const existingHospitalRecord = await BloodInventory.findOne({
        hospitalName: appointment.hospitalName
      });

      let hospitalData;
      
      if (existingHospitalRecord) {
        // Use existing hospital data
        console.log('✅ Found existing hospital data, copying details...');
        hospitalData = {
          hospitalName: existingHospitalRecord.hospitalName,
          hospitalType: existingHospitalRecord.hospitalType,
          city: existingHospitalRecord.city,
          division: existingHospitalRecord.division,
          phone: existingHospitalRecord.phone,
          email: existingHospitalRecord.email,
          is247: existingHospitalRecord.is247
        };
      } else {
        // No existing record - use appointment data as fallback
        console.log('⚠️ No existing hospital records found, using appointment data...');
        
        // Parse city and division from address
        const addressParts = appointment.hospitalAddress.split(',').map(s => s.trim());
        
        hospitalData = {
          hospitalName: appointment.hospitalName,
          hospitalType: 'GOVERNMENT', // Default
          city: addressParts[0] || 'Unknown',
          division: addressParts[1] || addressParts[0] || 'Unknown',
          phone: appointment.hospitalPhone || 'N/A',
          email: `contact@${appointment.hospitalName.toLowerCase().replace(/\s+/g, '')}.com`,
          is247: false
        };
      }

      // Create new inventory record with quantity = 1
      inventory = new BloodInventory({
        ...hospitalData,
        bloodType: appointment.bloodGroup,
        quantity: 1, // First donation for this blood type
        expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
        status: 'CRITICAL' // Will be auto-updated by schema pre-save hook
      });

      await inventory.save();
      
      console.log('✅ NEW inventory record created:', {
        hospital: inventory.hospitalName,
        bloodType: inventory.bloodType,
        quantity: inventory.quantity,
        status: inventory.status
      });
    }

    // Update user's last donation date and points
    const user = await User.findById(req.user.id);
    if (user) {
      user.lastDonationDate = new Date();
      user.points = (user.points || 0) + 50;
      await user.save();
      
      console.log('✅ User updated:', {
        userId: user._id,
        points: user.points,
        lastDonation: user.lastDonationDate
      });
    }

    res.json({
      message: 'Donation completed successfully',
      appointment,
      pointsEarned: 50,
      inventoryUpdated: true,
      newRecord: !inventory.createdAt ? false : (new Date() - inventory.createdAt) < 1000 // Check if just created
    });

  } catch (error) {
    console.error('❌ Complete appointment error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment
// @access  Private
router.put('/:id/cancel', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.donor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (appointment.status !== 'SCHEDULED') {
      return res.status(400).json({ message: 'Can only cancel scheduled appointments' });
    }

    appointment.status = 'CANCELLED';
    await appointment.save();

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.donor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (appointment.status !== 'SCHEDULED') {
      return res.status(400).json({ message: 'Can only update scheduled appointments' });
    }

    // Update allowed fields
    const { appointmentDate, appointmentTime, notes } = req.body;

    if (appointmentDate) {
      const apptDate = new Date(appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (apptDate < today) {
        return res.status(400).json({ message: 'Appointment date must be in the future' });
      }
      appointment.appointmentDate = apptDate;
    }

    if (appointmentTime) appointment.appointmentTime = appointmentTime;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    res.json({
      message: 'Appointment updated successfully',
      appointment
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/hospital/:hospitalId
// @desc    Get all appointments for a hospital (admin use)
// @access  Private
router.get('/hospital/:hospitalId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      hospitalId: req.params.hospitalId 
    })
    .populate('donor', 'name phone bloodGroup email')
    .sort({ appointmentDate: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get hospital appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/stats/overview
// @desc    Get appointment statistics
// @access  Private
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = {
      total: await Appointment.countDocuments({ donor: userId }),
      scheduled: await Appointment.countDocuments({ donor: userId, status: 'SCHEDULED' }),
      completed: await Appointment.countDocuments({ donor: userId, status: 'COMPLETED' }),
      cancelled: await Appointment.countDocuments({ donor: userId, status: 'CANCELLED' })
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;