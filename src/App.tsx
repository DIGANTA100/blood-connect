import React, { useState, useEffect } from 'react';
import { Heart, Map, Database, MessageCircle, User as UserIcon, LogOut, Menu, X, Zap, Droplet, MessageSquare, Calendar } from 'lucide-react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import EmergencyMap from './components/EmergencyMap';
import Inventory from './components/Inventory';
import MythsAssistant from './components/MythsAssistant';
import Profile from './components/Profile';
import RequestBlood from './components/RequestBlood';
import Chat from './components/Chat';
import Appointments from './components/Appointments';
import AppointmentBooking from './components/AppointmentBooking';
import { User, BloodGroup } from './types';

type Tab = 'dashboard' | 'map' | 'inventory' | 'myths' | 'profile' | 'request' | 'chat' | 'appointments' | 'book-appointment';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [requestPrefillData, setRequestPrefillData] = useState<{
    hospitalName?: string;
    address?: string;
    contactPhone?: string;
  } | undefined>(undefined);
  const [appointmentPrefillData, setAppointmentPrefillData] = useState<{
    hospitalId?: string;
    hospitalName?: string;
    hospitalAddress?: string;
    hospitalPhone?: string;
    bloodGroup?: BloodGroup;
  } | undefined>(undefined);

  const handleNavigateToRequest = (hospitalInfo: { name: string; address: string; phone: string }) => {
    setRequestPrefillData({
      hospitalName: hospitalInfo.name,
      address: hospitalInfo.address,
      contactPhone: hospitalInfo.phone
    });
    setActiveTab('request');
  };

  const handleNavigateToAppointment = (data: {
    hospitalId: string;
    hospitalName: string;
    hospitalAddress: string;
    hospitalPhone: string;
    bloodGroup: BloodGroup;
  }) => {
    setAppointmentPrefillData(data);
    setActiveTab('book-appointment');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('bloodconnect_current_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('bloodconnect_current_user');
      }
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('bloodconnect_current_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bloodconnect_current_user');
    localStorage.removeItem('jwt_token');
    setActiveTab('dashboard');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bn' : 'en');
  };

  if (!user) {
    return <Auth onLogin={handleLogin} language={language} onToggleLanguage={toggleLanguage} />;
  }

  const navItems = [
    { id: 'dashboard' as Tab, label: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' }, icon: Heart },
    { id: 'request' as Tab, label: { en: 'Request Blood', bn: 'রক্তের অনুরোধ' }, icon: Droplet },
    { id: 'appointments' as Tab, label: { en: 'Appointments', bn: 'অ্যাপয়েন্টমেন্ট' }, icon: Calendar },
    { id: 'map' as Tab, label: { en: 'Emergency Map', bn: 'জরুরী ম্যাপ' }, icon: Map },
    { id: 'inventory' as Tab, label: { en: 'Inventory', bn: 'ইনভেন্টরি' }, icon: Database },
    { id: 'chat' as Tab, label: { en: 'Messages', bn: 'বার্তা' }, icon: MessageSquare },
    { id: 'myths' as Tab, label: { en: 'AI Assistant', bn: 'এআই সহায়ক' }, icon: MessageCircle },
    { id: 'profile' as Tab, label: { en: 'Profile', bn: 'প্রোফাইল' }, icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 md:h-16 gap-2">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-red-600 p-1.5 md:p-2 rounded-xl shadow-lg">
                <Heart className="text-white" size={20} fill="white" />
              </div>
              <div>
                <h1 className="text-base md:text-xl font-black text-gray-900 tracking-tight">BloodConnect</h1>
                <p className="text-[7px] md:text-[8px] font-bold text-gray-400 uppercase tracking-widest">Bangladesh</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide justify-center max-w-full">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === item.id
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={16} />
                  <span className="hidden xl:inline">{item.label[language]}</span>
                </button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={toggleLanguage}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-200 transition-all whitespace-nowrap"
              >
                {language === 'en' ? 'বাংলা' : 'EN'}
              </button>
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all whitespace-nowrap"
              >
                <LogOut size={16} />
                <span className="hidden xl:inline">{language === 'en' ? 'Logout' : 'লগআউট'}</span>
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-gray-100 text-gray-600"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top-4 duration-200">
            <div className="px-4 py-4 space-y-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === item.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label[language]}
                </button>
              ))}
              <button
                onClick={toggleLanguage}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100"
              >
                <Zap size={20} />
                {language === 'en' ? 'Switch to বাংলা' : 'Switch to English'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
              >
                <LogOut size={20} />
                {language === 'en' ? 'Logout' : 'লগআউট'}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard language={language} user={user} onNavigate={setActiveTab} />}
        {activeTab === 'request' && <RequestBlood language={language} user={user} prefillData={requestPrefillData} />}
        {activeTab === 'appointments' && <Appointments language={language} user={user} />}
        {activeTab === 'book-appointment' && (
          <AppointmentBooking 
            language={language} 
            user={user} 
            prefillData={appointmentPrefillData}
            onSuccess={() => setActiveTab('appointments')}
          />
        )}
        {activeTab === 'map' && <EmergencyMap language={language} />}
        {activeTab === 'inventory' && (
          <Inventory 
            language={language} 
            user={user} 
            onNavigateToRequest={handleNavigateToRequest}
            onNavigateToAppointment={handleNavigateToAppointment}
          />
        )}
        {activeTab === 'chat' && <Chat language={language} user={user} />}
        {activeTab === 'myths' && <MythsAssistant language={language} />}
        {activeTab === 'profile' && <Profile user={user} language={language} />}
      </main>
    </div>
  );
}

export default App;