
# 🩸 BloodConnect Bangladesh

A modern, bilingual (English/বাংলা) blood donation management platform connecting donors with recipients across Bangladesh. Built with React, TypeScript, and Express.js.


## ✨ Features

- **🌐 Bilingual Support**: Complete English and Bengali (বাংলা) language interface
- **🗺️ Real-time Emergency Map**: Interactive Leaflet map displaying urgent blood requests
- **🤖 AI Health Assistant**: Google Gemini-powered chatbot for blood donation myths and health advice
- **🏥 Inventory Management**: Real-time blood stock tracking across hospitals and blood banks
- **📊 Donor Dashboard**: Personal statistics, reward points, and donation history
- **🌙 Ramadan Special**: Post-Iftar donation slot booking system
- **💬 User Messaging**: Direct communication between donors and recipients
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🎯 Gamification**: Achievement badges and reward system to encourage donations

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **MongoDB Atlas** account (for database)
- **Google Gemini API key** ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/bloodconnect-bangladesh.git
cd bloodconnect-bangladesh
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

4. **Configure environment variables**

Create a `.env` file in the **root directory**:
```env
# Google Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

Create a `.env` file in the **backend directory**:
```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret (use a strong random string)
JWT_SECRET=your_secure_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

5. **Start the development servers**

**Frontend** (from root directory):
```bash
npm run dev
```

**Backend** (open a new terminal, navigate to backend folder):
```bash
cd backend
npm start
```

6. **Open your browser**
Navigate to `http://localhost:5173` (Vite default port)

### Building for Production

```bash
# Build frontend
npm run build

# Build output will be in the dist/ folder
```

## 📁 Project Structure

```
bloodconnect-bangladesh/
│
├── src/                          # Frontend Source Code
│   ├── components/               # React Components
│   │   ├── Auth.tsx             # Authentication (Login/Register)
│   │   ├── Dashboard.tsx        # Main dashboard with statistics
│   │   ├── RequestBlood.tsx     # Blood request submission form
│   │   ├── Inventory.tsx        # Blood inventory viewer
│   │   ├── AppointmentBooking.tsx  # Donation appointment booking
│   │   ├── Appointments.tsx     # User's appointments list
│   │   ├── Chat.tsx             # Real-time messaging interface
│   │   ├── MythsAssistant.tsx   # AI-powered health assistant
│   │   ├── EmergencyMap.tsx     # Interactive blood request map
│   │   └── Profile.tsx          # User profile management
│   │
│   ├── services/                 # API Service Layer
│   │   ├── authService.ts       # Authentication API calls
│   │   ├── dashboardService.ts  # Dashboard data fetching
│   │   ├── inventoryService.ts  # Inventory management
│   │   ├── requestService.ts    # Blood request operations
│   │   ├── appointmentService.ts # Appointment handling
│   │   ├── chatService.ts       # Chat messaging
│   │   └── geminiService.ts     # Google Gemini AI integration
│   │
│   ├── App.tsx                   # Root component
│   ├── main.tsx                 # Vite entry point
│   ├── types.ts                 # TypeScript type definitions
│   └── index.css                # Global styles
│
├── backend/                      # Backend Server
│   ├── models/                   # MongoDB Mongoose Models
│   │   ├── User.js              # User schema
│   │   ├── BloodInventory.js    # Blood stock tracking
│   │   ├── BloodRequest.js      # Blood requests
│   │   ├── Appointment.js       # Donation appointments
│   │   ├── Conversation.js      # Chat conversations
│   │   └── Message.js           # Chat messages
│   │
│   ├── routes/                   # API Route Handlers
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── users.js             # User management
│   │   ├── inventory.js         # Blood inventory
│   │   ├── requests.js          # Blood requests
│   │   ├── appointments.js      # Appointments
│   │   ├── chat.js              # Messaging
│   │   ├── dashboard.js         # Dashboard statistics
│   │   └── notifications.js     # Notifications
│   │
│   ├── middleware/               # Express Middleware
│   │   └── auth.js              # JWT authentication
│   │
│   ├── utils/                    # Utility Functions
│   │   └── emailService.js      # Email notifications
│   │
│   ├── server.js                # Main Express server
│   ├── package.json             # Backend dependencies
│   └── .env                     # Backend environment variables
│
├── public/                       # Static Assets
├── index.html                    # HTML entry point
├── package.json                  # Frontend dependencies
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## 🔧 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **Leaflet** - Interactive map library
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing

### AI & APIs
- **Google Gemini API** - AI-powered health assistant

## 🎯 Key Features Breakdown

### 1. Authentication System
- Secure registration and login with JWT
- Age verification (18+ requirement)
- Bangladesh phone number validation (+880)
- Password strength validation
- Bilingual error messages

### 2. Dashboard
- Personal donation statistics
- Reward points system
- Donation history charts
- Blood inventory visualization
- Ramadan donation drive tracker
- Quick action buttons

### 3. Emergency Blood Request Map
- Real-time Leaflet map integration
- Emergency vs. normal request indicators
- Thalassemia patient highlighting
- Click-to-call functionality
- Division-wise filtering
- Blood group filtering

### 4. Inventory Management
- Hospital-wise blood stock tracking
- Division and city-based filtering
- Critical shortage alerts
- Blood group availability
- Expiry date monitoring
- Real-time updates

### 5. AI Health Assistant
- Google Gemini-powered chatbot
- Blood donation myth-busting
- Health and safety information
- Bangladesh-specific context
- Bilingual responses (English/বাংলা)
- Quick suggestion buttons

### 6. Appointment Booking
- Post-Iftar donation slots during Ramadan
- Hospital/center selection
- Time slot management
- Booking confirmation
- Appointment history

### 7. User Messaging System
- Direct donor-recipient communication
- Real-time message updates
- Conversation threads
- Message notifications

### 8. Profile Management
- Personal information display
- Medical records
- Emergency contacts
- Achievement badges
- Donation history

## 🌐 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
GET    /api/auth/me           - Get current user
```

### Blood Request Endpoints
```
GET    /api/requests          - Get all requests
POST   /api/requests          - Create new request
GET    /api/requests/:id      - Get specific request
PUT    /api/requests/:id      - Update request
DELETE /api/requests/:id      - Delete request
```

### Inventory Endpoints
```
GET    /api/inventory         - Get all inventory
GET    /api/inventory/:id     - Get specific inventory
PUT    /api/inventory/:id     - Update inventory
```

### Appointment Endpoints
```
GET    /api/appointments      - Get user appointments
POST   /api/appointments      - Create appointment
PUT    /api/appointments/:id  - Update appointment
DELETE /api/appointments/:id  - Cancel appointment
```

## 🐛 Troubleshooting

### Map not displaying
- Ensure Leaflet CSS and JS are properly loaded in `index.html`
- Check browser console for JavaScript errors
- Verify internet connection for map tiles

### AI Assistant not responding
- Verify your Gemini API key in `.env` file
- Ensure the key is active at [Google AI Studio](https://aistudio.google.com/)
- Restart the development server after updating `.env`
- Check browser console for API errors

### Backend connection issues
- Verify MongoDB connection string is correct
- Ensure MongoDB Atlas IP whitelist includes your IP
- Check if backend server is running on port 5000
- Verify `VITE_API_URL` matches backend URL

### Build errors
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again
- Ensure Node.js version is 18 or higher
- Clear npm cache: `npm cache clean --force`

### Authentication issues
- Check JWT_SECRET is set in backend `.env`
- Verify token expiration settings
- Clear browser localStorage and retry

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in hosting platform

### Backend (Render/Railway/Heroku)
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Environment Variables for Production
- Update `VITE_API_URL` to your production backend URL
- Use production MongoDB connection string
- Generate secure JWT secret
- Enable CORS for your frontend domain

## 📊 Database Schema

### User Model
- Personal information (name, email, phone)
- Blood group and medical history
- Role (donor/recipient/admin)
- Reward points and badges
- Donation history

### Blood Request Model
- Patient information
- Blood group and quantity needed
- Location and hospital
- Emergency status
- Contact details

### Appointment Model
- User reference
- Hospital/center
- Date and time slot
- Status (pending/confirmed/completed)

### Inventory Model
- Hospital/center name
- Blood group
- Quantity available
- Expiry date
- Location details

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@DIGANTA100](https://github.com/DIGANTA100)
- LinkedIn: [Ajmain Fayek Diganta](https://www.linkedin.com/in/ajmainfayekdiganta/)

## 🙏 Acknowledgments

- Thanks to all blood donors who save lives every day
- Google Gemini for AI capabilities
- Leaflet for mapping functionality
- The open-source community

## 📧 Contact & Support

For questions, suggestions, or support:
- Open an issue on [GitHub Issues](https://github.com/DIGANTA100/blood-connect/issues)
- Email: ajmainfayekdiganta@gmail.com

---

**Made with ❤️ for Bangladesh** | **Save Lives, Donate Blood** 🩸

