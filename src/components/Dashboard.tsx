
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Droplet, Users, Calendar, Award, TrendingUp, RefreshCw, AlertCircle, X, Check, MapPin, Clock } from 'lucide-react';
import { User } from '../types';
import { 
  fetchDashboardStats, 
  fetchTrends, 
  fetchInventoryData, 
  DashboardStats, 
  TrendData, 
  InventoryStats,
  getMockDashboardData 
} from '../services/dashboardService';

interface DashboardProps {
  language: 'en' | 'bn';
  user: User;
  onNavigate: (tab: 'dashboard' | 'map' | 'inventory' | 'myths' | 'profile' | 'request' | 'chat') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ language, user, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [inventory, setInventory] = useState<InventoryStats[]>([]);
  
  // Ramadan Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  const centers = [
    { id: 'dmch', name: { en: 'Dhaka Medical College', bn: 'ঢাকা মেডিকেল কলেজ' }, area: 'Bakshibazar' },
    { id: 'square', name: { en: 'Square Hospital', bn: 'স্কয়ার হাসপাতাল' }, area: 'Panthapath' },
    { id: 'apollo', name: { en: 'Evercare Hospital', bn: 'এভারকেয়ার হাসপাতাল' }, area: 'Bashundhara' },
    { id: 'bsmmu', name: { en: 'BSMMU (PG Hospital)', bn: 'বিএসএমএমইউ (পিজি)' }, area: 'Shahbagh' }
  ];

  const timeSlots = [
    { id: 't1', time: '07:30 PM', label: { en: 'After Iftar', bn: 'ইফতারের পর' } },
    { id: 't2', time: '08:45 PM', label: { en: 'After Taraweeh', bn: 'তারাবীহ্র পর' } },
    { id: 't3', time: '09:30 PM', label: { en: 'Night Slot 1', bn: 'রাত্রিকালীন স্লট ১' } },
    { id: 't4', time: '10:15 PM', label: { en: 'Night Slot 2', bn: 'রাত্রিকালীন স্লট ২' } }
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mock = getMockDashboardData();
        const stats = await fetchDashboardStats(user.points);
setDashboardStats(stats);
        setTrends(mock.trends);
        setInventory(mock.inventory);
      } catch (err) {
        console.error('Dashboard Load Error:', err);
        setError(language === 'en' ? 'Failed to sync with server' : 'সার্ভারের সাথে সংযোগ বিচ্ছিন্ন');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [language, user.points]);

  const handleConfirmSchedule = () => {
    if (!selectedCenter || !selectedTime) return;
    setIsScheduled(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsScheduled(false);
      setSelectedCenter('');
      setSelectedTime('');
    }, 2000);
  };

  const statCards = [
    { label: { en: 'Points Earned', bn: 'অর্জিত পয়েন্ট' }, value: dashboardStats?.points || 0, icon: <Award className="text-yellow-600" />, bg: 'bg-yellow-50' },
    { label: { en: 'Total Donors', bn: 'মোট দাতা' }, value: dashboardStats?.totalDonors.toLocaleString() || '0', icon: <Users className="text-blue-600" />, bg: 'bg-blue-50' },
    { label: { en: 'Lives Saved', bn: 'রক্ষিত জীবন' }, value: dashboardStats?.livesSaved.toLocaleString() || '0', icon: <TrendingUp className="text-green-600" />, bg: 'bg-green-50' },
    { label: { en: 'Recent Requests', bn: 'সাম্প্রতিক অনুরোধ' }, value: dashboardStats?.recentRequestsCount || 0, icon: <Droplet className="text-red-600" />, bg: 'bg-red-50' },
  ];

  const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <RefreshCw size={48} className="text-red-600 animate-spin" />
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          {language === 'en' ? 'Fetching Real-time Data...' : 'রিয়েল-টাইম ডাটা সংগ্রহ করা হচ্ছে...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {language === 'en' ? `Welcome back, ${user.name}!` : `স্বাগতম, ${user.name}!`}
          </h1>
          <p className="text-gray-500 font-medium">
            {language === 'en' ? 'Your contribution makes a difference.' : 'আপনার অবদান সমাজ গঠনে সাহায্য করে।'}
          </p>
        </div>
        
        {error && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-xs font-bold border border-orange-100">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button 
          onClick={() => onNavigate('map')}
          className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 active:scale-95 transition-all uppercase tracking-widest text-sm"
        >
          {language === 'en' ? 'Donate Now' : 'এখনই রক্ত দিন'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-[2rem] border border-white shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] cursor-default`}>
            <div className="p-4 bg-white rounded-2xl shadow-sm">
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{stat.label[language]}</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm flex items-center gap-2">
              <TrendingUp size={18} className="text-red-600" />
              {language === 'en' ? 'Donation Trends' : 'রক্তদানের প্রবণতা'}
            </h3>
            <div className="bg-gray-100 px-3 py-1.5 rounded-xl text-[10px] font-black text-gray-500 uppercase">
              {language === 'en' ? 'Last 6 Months' : 'বিগত ৬ মাস'}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#9ca3af'}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}} 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} 
                />
                <Bar dataKey="count" fill="#ef4444" radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm mb-8 flex items-center gap-2">
            <Droplet size={18} className="text-red-600" />
            {language === 'en' ? 'Stock Availability' : 'রক্তের মজুদ'}
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventory}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  nameKey="group"
                >
                  {inventory.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-3">
            {inventory.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{item.group}</span>
                </div>
                <span className="text-sm font-black text-gray-900">{item.value} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Calendar size={12} /> Live Event
          </div>
          <h2 className="text-3xl font-black mb-3">
            {language === 'en' ? 'Ramadan Donation Drive' : 'রমজান রক্তদান অভিযান'}
          </h2>
          <p className="text-gray-400 font-medium max-w-lg text-lg leading-relaxed">
            {language === 'en' 
              ? 'Our donation centers are fully operational after Iftar. Donate during the holy month and earn double reward points.' 
              : 'আমাদের কেন্দ্রগুলো ইফতারের পর পূর্ণভাবে সচল থাকবে। পবিত্র মাসে রক্ত দিন এবং দ্বিগুণ রিওয়ার্ড পয়েন্ট অর্জন করুন।'}
          </p>
          <div className="mt-8 flex gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-gray-900 px-8 py-3 rounded-2xl font-black hover:bg-gray-100 transition-all uppercase tracking-widest text-xs shadow-xl shadow-white/5"
            >
              {language === 'en' ? 'Schedule for Iftar' : 'ইফতারের জন্য সময় নিন'}
            </button>
          </div>
        </div>
        <div className="bg-red-600/10 w-80 h-80 rounded-full absolute -right-20 -top-20 opacity-50 blur-3xl transition-all group-hover:scale-110"></div>
        <Calendar className="relative z-10 opacity-10 text-white" size={200} />
      </div>

      {/* Ramadan Scheduling Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">{language === 'en' ? 'Ramadan Slot Booking' : 'রমজান স্লট বুকিং'}</h3>
                <p className="text-gray-400 text-sm font-medium">{language === 'en' ? 'Participating Medical Centers (Post-Iftar)' : 'অংশগ্রহণকারী মেডিকেল সেন্টার (ইফতার পরবর্তী)'}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {!isScheduled ? (
                <>
                  <section>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">1. {language === 'en' ? 'Select Center' : 'সেন্টার নির্বাচন করুন'}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {centers.map(center => (
                        <button
                          key={center.id}
                          onClick={() => setSelectedCenter(center.id)}
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${
                            selectedCenter === center.id 
                            ? 'border-red-600 bg-red-50' 
                            : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <MapPin size={18} className={selectedCenter === center.id ? 'text-red-600' : 'text-gray-400'} />
                            {selectedCenter === center.id && <Check size={16} className="text-red-600" />}
                          </div>
                          <p className={`font-black mt-2 ${selectedCenter === center.id ? 'text-red-900' : 'text-gray-900'}`}>{center.name[language]}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{center.area}, Dhaka</p>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">2. {language === 'en' ? 'Select Time Slot' : 'সময় নির্বাচন করুন'}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {timeSlots.map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedTime(slot.id)}
                          className={`p-3 rounded-2xl border-2 text-center transition-all ${
                            selectedTime === slot.id 
                            ? 'border-red-600 bg-red-600 text-white shadow-lg shadow-red-100' 
                            : 'border-gray-100 hover:border-gray-200 text-gray-900'
                          }`}
                        >
                          <Clock size={16} className={`mx-auto mb-1 ${selectedTime === slot.id ? 'text-white' : 'text-gray-400'}`} />
                          <p className="text-xs font-black">{slot.time}</p>
                          <p className={`text-[9px] font-bold uppercase ${selectedTime === slot.id ? 'text-red-100' : 'text-gray-400'}`}>{slot.label[language]}</p>
                        </button>
                      ))}
                    </div>
                  </section>

                  <button
                    disabled={!selectedCenter || !selectedTime}
                    onClick={handleConfirmSchedule}
                    className="w-full bg-red-600 text-white py-5 rounded-[2rem] font-black shadow-xl shadow-red-100 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                  >
                    {language === 'en' ? 'Confirm Slot' : 'স্লট নিশ্চিত করুন'}
                  </button>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <Check size={40} strokeWidth={3} />
                  </div>
                  <h4 className="text-2xl font-black text-gray-900 mb-2">{language === 'en' ? 'Slot Confirmed!' : 'স্লট নিশ্চিত করা হয়েছে!'}</h4>
                  <p className="text-gray-500 font-medium max-w-sm">
                    {language === 'en' 
                      ? 'Your Iftar donation slot has been reserved. You will receive an SMS reminder 2 hours before.' 
                      : 'আপনার ইফতার রক্তদানের স্লটটি সংরক্ষিত হয়েছে। আপনি ২ ঘণ্টা আগে একটি এসএমএস রিমাইন্ডার পাবেন।'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
