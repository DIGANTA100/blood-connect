# 🩸 BloodConnect 

A modern, bilingual (English/বাংলা) blood donation management platform connecting donors with those in need across Bangladesh.

## ✨ Features

- **Bilingual Support**: Full English and Bengali language support
- **Real-time Emergency Map**: Interactive Leaflet map showing blood requests
- **AI Health Assistant**: Gemini-powered chatbot for myth-busting and health advice
- **Inventory Management**: Track blood stock levels across hospitals
- **Donor Dashboard**: Personal dashboard with points and statistics
- **Ramadan Special**: Post-Iftar donation slot booking system
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Google Gemini API key (get it from (https://makersuite.google.com/app/apikey))

### Installation

1. **Clone this repository**

2. **Install dependencies**:
```bash
npm install
npm install d3

```

3. **Set up environment variables**:
```bash

# backend .env file should contain:

MONGODB_URI=mongodb+srv://ajmainfayekdiganta_db_user:qDwEeSWvM6pxPiSx@bloodconnect.6jado0c.mongodb.net/?appName=bloodconnect

JWT_SECRET=kdsjfK32dksldfsksdAd323lksdkskskfsdkjieksjio232klSDFWEsjfeisakdjiweksjdei

PORT=5000
NODE_ENV=development
VITE_OPENAI_API_KEY=
```

4. **Run the development server**:
```bash
#start
npm run dev 
#terminate
ctrl + C 

```

5. **Open your browser** to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The production files will be in the `dist/` folder.

## 📁 Project Structure

```
##Frontend 
src/
├── components/              # React Components
│   ├── Auth.tsx            # Login/Register UI
│   ├── Dashboard.tsx       # Main dashboard view
│   ├── RequestBlood.tsx    # Blood request form
│   ├── Inventory.tsx       # Blood inventory viewer
│   ├── AppointmentBooking.tsx  # Appointment booking form
│   ├── Appointments.tsx    # User's appointments list
│   ├── Chat.tsx            # Real-time chat interface
│   ├── MythsAssistant.tsx  # AI-powered myths assistant
│   ├── EmergencyMap.tsx    # Interactive blood request map
│   └── Profile.tsx         # User profile management
│
├── services/                # API Service Layer
│   ├── authService.ts      # Authentication API calls
│   ├── dashboardService.ts # Dashboard data fetching
│   ├── inventoryService.ts # Inventory API calls
│   ├── requestService.ts   # Blood request API calls
│   ├── appointmentService.ts # Appointment API calls
│   ├── chatService.ts      # Chat messaging API calls
│   └── geminiService.ts    # Gemini/OpenAI integration
│
├── App.tsx                  # Root component
├── main.tsx                # Vite entry point
└── index.css               # Global styles

##Backend

backend/
├── config/                    # Configuration Files
│   ├── database.js           # MongoDB connection setup
│   └── constants.js          # Application constants (blood types, roles, etc)
│
├── models/                    # MongoDB Mongoose Models
│   ├── User.js               # User schema (donors, recipients, admins)
│   ├── BloodInventory.js     # Blood stock tracking
│   ├── BloodRequest.js       # Blood request submissions
│   ├── Appointment.js        # Donation appointment bookings
│   ├── Conversation.js       # Chat conversation threads
│   └── Message.js            # Chat messages
│
├── routes/                    # API Route Handlers
│   ├── auth.js               # Auth endpoints (register, login)
│   ├── users.js              # User profile management
│   ├── inventory.js          # Blood inventory endpoints
│   ├── requests.js           # Blood request endpoints
│   ├── appointments.js       # Appointment booking endpoints
│   ├── chat.js               # Chat messaging endpoints
│   ├── dashboard.js          # Dashboard statistics endpoints
│   └── notifications.js      # Notification endpoints
│
├── middleware/                # Express Middleware
│   └── auth.js               # JWT authentication middleware
│
├── controllers/               # Route Logic Controllers
│   └── authController.js     # Authentication controller
│
├── helpers/                   # Helper Functions
│   └── responseHandler.js    # Standardized API response formatting
│
├── validators/                # Input Validation
│   └── authValidator.js      # Auth endpoint validation rules
│
├── utils/                     # Utility Functions
│   └── emailService.js       # Email sending service
│
├── server.js                 # Main Express server file
├── package.json              # Backend dependencies
├── package-lock.json
├── .env                      # Backend environment variables
├── .env.example             # Environment template
└── .gitignore               # Git ignore rules
```

## 🔧 Key Technologies

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Leaflet** for interactive maps
- **Google Open AI** for health assistant
- **LocalStorage** for mock database (development) (in Future connet into  Claude MongoDB Atlas)
- **BackEed** Express js and connects APIs from front to backend

## 🎨 Features Breakdown

### 1. Authentication System
- Secure login/signup with validation
- Age verification (18+)
- Phone number validation (Bangladesh format)
- Password strength indicator
- Bilingual forms

### 2. Dashboard
- Personal statistics and reward points
- Donation trends charts
- Blood inventory pie chart
- Ramadan donation drive with slot booking
- Real-time data updates

### 3. Emergency Map
- Interactive map powered by Leaflet
- Live blood request markers
- Emergency vs Normal request indicators
- Click to view details and call
- Special Thalassemia patient badges

### 4. Inventory Management
- Complete hospital blood stock tracking
- Division-wise summaries
- Critical shortage alerts
- Expiry date monitoring
- Filtering by city, type, and blood group

### 5. AI Health Assistant 
- Powered by Google Gemini
- Myth-busting about blood donation
- Health safety information
- Culturally relevant for Bangladesh
- Quick suggestion buttons

### 6. Profile Management
- Personal information display
- Medical records
- Emergency contacts
- Achievement badges (gamification)
### 7.User to User Message System
- Login user can communicate with themselves for blood requests
## 🌐 Deployment


## Get the OpenAi Api key (activated)

## 🐛 Troubleshooting

### Map not showing
- Make sure Leaflet CSS and JS are loaded (check `index.html`)
- Check browser console for errors

### AI Assistant not working
- Verify your Gemini API key is correct in `.env`
- Make sure the file is named `.env` (not `.env.txt`)
- Restart the dev server after adding the API key

### Build errors
- Delete `node_modules` and run `npm install` again
- Make sure you're using Node.js 18 or higher

## 📝 License

This project is open source and available for educational purposes.



## 📧 Contact

For questions or support, please open an issue on GitHub.



