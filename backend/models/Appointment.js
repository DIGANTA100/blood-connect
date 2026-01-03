import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donorName: {
    type: String,
    required: true
  },
  donorPhone: {
    type: String,
    required: true
  },
  donorBloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  hospitalId: {
    type: String,
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  hospitalAddress: {
    type: String,
    required: true
  },
  hospitalPhone: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'SCHEDULED'
  },
  notes: {
    type: String,
    default: ''
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
appointmentSchema.index({ donor: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ hospitalId: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;