import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import inventoryRoutes from './routes/inventory.js';
import requestRoutes from './routes/requests.js';
import dashboardRoutes from './routes/dashboard.js';
import notificationRoutes from './routes/notifications.js';
import chatRoutes from './routes/chat.js';

import appointmentRoutes from './routes/appointments.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    seedInitialData(); // Seed some initial data
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/appointments', appointmentRoutes);


// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BloodConnect API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
});

// Seed initial data function
async function seedInitialData() {
  const { default: BloodInventory } = await import('./models/BloodInventory.js');
  const { default: BloodRequest } = await import('./models/BloodRequest.js');
  
  const inventoryCount = await BloodInventory.countDocuments();
  const requestCount = await BloodRequest.countDocuments();
  
  if (inventoryCount === 0) {
    console.log('📦 Seeding initial inventory data...');
    const sampleInventory = [
      {
        hospitalName: 'Dhaka Medical College Hospital',
        hospitalType: 'GOVERNMENT',
        city: 'Dhaka',
        division: 'Dhaka',
        phone: '+880255165088',
        email: 'info@dmch.gov.bd',
        is247: true,
        bloodType: 'A+',
        quantity: 120,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'OPTIMAL'
      },
      {
        hospitalName: 'Square Hospital Ltd',
        hospitalType: 'PRIVATE',
        city: 'Dhaka',
        division: 'Dhaka',
        phone: '10616',
        email: 'info@squarehospital.com',
        is247: true,
        bloodType: 'O-',
        quantity: 8,
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'CRITICAL'
      }
    ];
    await BloodInventory.insertMany(sampleInventory);
    console.log('✅ Inventory data seeded');
  }
  
  if (requestCount === 0) {
    console.log('📦 Seeding initial request data...');
    const sampleRequests = [
      {
        hospitalName: 'Dhaka Medical College Hospital',
        bloodGroup: 'B+',
        unitsNeeded: 2,
        urgency: 'EMERGENCY',
        location: {
          lat: 23.7259,
          lng: 90.3973,
          address: 'Bakshibazar, Dhaka'
        },
        contactPhone: '01712345678',
        status: 'OPEN'
      }
    ];
    await BloodRequest.insertMany(sampleRequests);
    console.log('✅ Request data seeded');
  }
}

export default app;