import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  unitsNeeded: {
    type: Number,
    required: true,
    min: 1
  },
  urgency: {
    type: String,
    required: true,
    enum: ['EMERGENCY', 'URGENT', 'NORMAL'],
    default: 'NORMAL'
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  contactPhone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'FULFILLED', 'CANCELLED'],
    default: 'OPEN'
  },
  patientName: {
    type: String,
    default: ''
  },
  relationship: {
    type: String,
    default: ''
  },
  additionalNotes: {
    type: String,
    default: ''
  },
  isThalassemiaPatient: {
    type: Boolean,
    default: false
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  fulfilledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
bloodRequestSchema.index({ status: 1, urgency: -1 });
bloodRequestSchema.index({ bloodGroup: 1, status: 1 });
bloodRequestSchema.index({ requestedBy: 1 });

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);

export default BloodRequest;