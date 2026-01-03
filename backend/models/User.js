import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    match: /^\+8801[3-9]\d{8}$/
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  dob: {
    type: Date,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  weight: {
    type: Number,
    required: true,
    min: 50
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  emergencyContactName: {
    type: String,
    default: ''
  },
  emergencyContactPhone: {
    type: String,
    default: ''
  },
  preferredCenter: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['DONOR', 'ADMIN'],
    default: 'DONOR'
  },
  location: {
    lat: {
      type: Number,
      default: 23.8103
    },
    lng: {
      type: Number,
      default: 90.4125
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ bloodGroup: 1, district: 1 });

const User = mongoose.model('User', userSchema);

export default User;