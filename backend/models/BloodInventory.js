import mongoose from 'mongoose';

const bloodInventorySchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: true
  },
  hospitalType: {
    type: String,
    required: true,
    enum: ['GOVERNMENT', 'PRIVATE', 'THALASSEMIA_CENTER']
  },
  city: {
    type: String,
    required: true
  },
  division: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  is247: {
    type: Boolean,
    default: false
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['CRITICAL', 'LOW', 'OPTIMAL'],
    default: 'OPTIMAL'
  }
}, {
  timestamps: true
});

// Automatically update status based on quantity
bloodInventorySchema.pre('save', function(next) {
  if (this.quantity < 10) {
    this.status = 'CRITICAL';
  } else if (this.quantity < 30) {
    this.status = 'LOW';
  } else {
    this.status = 'OPTIMAL';
  }
  next();
});

// Index for faster queries
bloodInventorySchema.index({ hospitalName: 1, bloodType: 1 });
bloodInventorySchema.index({ status: 1 });

const BloodInventory = mongoose.model('BloodInventory', bloodInventorySchema);

export default BloodInventory;