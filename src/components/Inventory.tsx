import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, Search, Filter, AlertCircle, RefreshCw, Clock, 
  MapPin, Phone, Mail, Building2, ShieldAlert, CheckCircle2, 
  ChevronRight, Download, FileText, ExternalLink, Activity, X, Droplet, Heart
} from 'lucide-react';
import { BloodGroup, User } from '../types';


interface InventoryProps {
  language: 'en' | 'bn';
  user: User;
  onNavigateToRequest?: (hospitalInfo: { name: string; address: string; phone: string }) => void;
  onNavigateToAppointment?: (data: {
    hospitalId: string;
    hospitalName: string;
    hospitalAddress: string;
    hospitalPhone: string;
    bloodGroup: BloodGroup;
  }) => void;
}

interface Hospital {
  id: string;
  name: string;
  type: 'GOVERNMENT' | 'PRIVATE' | 'THALASSEMIA_CENTER';
  city: string;
  division: string;
  phone: string;
  email: string;
  is247: boolean;
  bloodStock: {
    [key in BloodGroup]: {
      quantity: number;
      status: 'CRITICAL' | 'LOW' | 'OPTIMAL';
      expiryDate: string;
    };
  };
  lastUpdated: string;
}

interface DonateModalData {
  hospital: Hospital;
  bloodGroup: BloodGroup;
}

const Inventory: React.FC<InventoryProps> = ({ language, user, onNavigateToRequest, onNavigateToAppointment }) => {
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [filterCity, setFilterCity] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [donateModal, setDonateModal] = useState<DonateModalData | null>(null);
  const [donating, setDonating] = useState(false);
  const [donateSuccess, setDonateSuccess] = useState(false);

  const fetchData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/inventory/hospitals`);
      
      if (response.ok) {
        const data = await response.json();
        setHospitals(data);
      } else {
        // Fallback to mock data
        setHospitals(getMockHospitals());
      }
      setLastSynced(new Date());
    } catch (error) {
      console.error("Inventory Fetch Error:", error);
      setHospitals(getMockHospitals());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const processedHospitals = useMemo(() => {
    let list = [...hospitals];

    if (searchQuery) {
      list = list.filter(h => 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCity !== 'All') list = list.filter(h => h.city === filterCity);
    if (filterType !== 'All') list = list.filter(h => h.type === filterType);

    return list;
  }, [hospitals, searchQuery, filterCity, filterType]);

  const criticalShortages = useMemo(() => {
    const shortages: { bloodGroup: BloodGroup; count: number }[] = [];
    const bloodTypes: BloodGroup[] = ['O-', 'B-', 'A-', 'AB-', 'A+', 'B+', 'O+', 'AB+'];
    
    bloodTypes.forEach(type => {
      let totalStock = 0;
      hospitals.forEach(h => {
        totalStock += h.bloodStock[type].quantity;
      });
      
      const needed = ['O-', 'B-', 'A-', 'AB-'].includes(type) ? 50 : 100;
      if (totalStock < needed) {
        shortages.push({ bloodGroup: type, count: totalStock });
      }
    });

    return shortages;
  }, [hospitals]);

  const handleDonate = async () => {
  if (!donateModal) return;

  // Instead of direct donation, navigate to create appointment
  setDonateModal(null);
  if (onNavigateToAppointment) {
    onNavigateToAppointment({
      hospitalId: donateModal.hospital.id,
      hospitalName: donateModal.hospital.name,
      hospitalAddress: `${donateModal.hospital.city}, ${donateModal.hospital.division}`,
      hospitalPhone: donateModal.hospital.phone,
      bloodGroup: donateModal.bloodGroup
    });
  }
};

  const bloodColors: Record<BloodGroup, string> = {
    'A+': 'bg-blue-600', 'A-': 'bg-blue-400',
    'O+': 'bg-red-600', 'O-': 'bg-red-500',
    'B+': 'bg-orange-600', 'B-': 'bg-orange-400',
    'AB+': 'bg-purple-600', 'AB-': 'bg-purple-400',
  };

  const getTimeAgo = (isoString: string) => {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    return `${Math.floor(diff/3600)}h ago`;
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>BloodConnect Inventory Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #dc2626; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #dc2626; color: white; }
          .critical { background-color: #fee2e2; }
          .low { background-color: #fef3c7; }
          .optimal { background-color: #d1fae5; }
        </style>
      </head>
      <body>
        <h1>🩸 BloodConnect Bangladesh - Inventory Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Hospital</th>
              <th>City</th>
              <th>A+</th>
              <th>A-</th>
              <th>B+</th>
              <th>B-</th>
              <th>AB+</th>
              <th>AB-</th>
              <th>O+</th>
              <th>O-</th>
            </tr>
          </thead>
          <tbody>
            ${processedHospitals.map(h => `
              <tr>
                <td>${h.name}</td>
                <td>${h.city}</td>
                <td class="${h.bloodStock['A+'].status.toLowerCase()}">${h.bloodStock['A+'].quantity}U</td>
                <td class="${h.bloodStock['A-'].status.toLowerCase()}">${h.bloodStock['A-'].quantity}U</td>
                <td class="${h.bloodStock['B+'].status.toLowerCase()}">${h.bloodStock['B+'].quantity}U</td>
                <td class="${h.bloodStock['B-'].status.toLowerCase()}">${h.bloodStock['B-'].quantity}U</td>
                <td class="${h.bloodStock['AB+'].status.toLowerCase()}">${h.bloodStock['AB+'].quantity}U</td>
                <td class="${h.bloodStock['AB-'].status.toLowerCase()}">${h.bloodStock['AB-'].quantity}U</td>
                <td class="${h.bloodStock['O+'].status.toLowerCase()}">${h.bloodStock['O+'].quantity}U</td>
                <td class="${h.bloodStock['O-'].status.toLowerCase()}">${h.bloodStock['O-'].quantity}U</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const exportToExcel = () => {
    const headers = ['Hospital', 'Type', 'City', 'Phone', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const rows = processedHospitals.map(h => [
      h.name,
      h.type,
      h.city,
      h.phone,
      h.bloodStock['A+'].quantity,
      h.bloodStock['A-'].quantity,
      h.bloodStock['B+'].quantity,
      h.bloodStock['B-'].quantity,
      h.bloodStock['AB+'].quantity,
      h.bloodStock['AB-'].quantity,
      h.bloodStock['O+'].quantity,
      h.bloodStock['O-'].quantity
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bloodconnect_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const labels = {
    title: { en: 'Blood Inventory', bn: 'রক্ত ইনভেন্টরি' },
    donate: { en: 'Donate Blood', bn: 'রক্ত দান করুন' },
    donateAt: { en: 'Donate at', bn: 'দান করুন' },
    selectBlood: { en: 'Select Blood Group', bn: 'রক্তের গ্রুপ নির্বাচন করুন' },
    confirmDonate: { en: 'Confirm Donation', bn: 'দান নিশ্চিত করুন' },
    cancel: { en: 'Cancel', bn: 'বাতিল' },
    success: { en: 'Donation Recorded Successfully!', bn: 'দান সফলভাবে রেকর্ড হয়েছে!' },
    thankYou: { en: 'Thank you for saving lives!', bn: 'জীবন বাঁচানোর জন্য ধন্যবাদ!' }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px] flex items-center gap-2">
              <Activity size={14} className="text-red-600" />
              {labels.title[language]}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={exportToPDF}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors" 
                title="Export PDF"
              >
                <FileText size={18} />
              </button>
              <button 
                onClick={exportToExcel}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors" 
                title="Export Excel"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Total Hospitals</p>
              <p className="text-xl font-black text-gray-900">{hospitals.length}</p>
            </div>
            <div className="text-center p-3 rounded-2xl bg-red-50 border border-red-100">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-tighter">Critical</p>
              <p className="text-xl font-black text-red-600">{criticalShortages.length}</p>
            </div>
            <div className="text-center p-3 rounded-2xl bg-green-50 border border-green-100">
              <p className="text-[10px] font-black text-green-400 uppercase tracking-tighter">Your Blood</p>
              <p className="text-xl font-black text-green-600">{user.bloodGroup}</p>
            </div>
            <div className="text-center p-3 rounded-2xl bg-blue-50 border border-blue-100">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Last Sync</p>
              <p className="text-xs font-black text-blue-600">{getTimeAgo(lastSynced.toISOString())}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hospital or city..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:outline-none font-bold text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold outline-none cursor-pointer"
              value={filterCity} onChange={(e) => setFilterCity(e.target.value)}
            >
              <option value="All">All Cities</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chittagong">Chittagong</option>
              <option value="Bogura">Bogura</option>
            </select>
            <select 
              className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold outline-none cursor-pointer"
              value={filterType} onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="GOVERNMENT">Government</option>
              <option value="PRIVATE">Private</option>
              <option value="THALASSEMIA_CENTER">Thalassemia</option>
            </select>
            <button 
              onClick={fetchData}
              className="p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin text-red-600' : 'text-gray-400'} />
            </button>
          </div>
        </div>
      </div>

      {/* Hospitals List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw size={48} className="text-red-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {processedHospitals.map(hospital => (
            <div key={hospital.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              {/* Hospital Header */}
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${
                      hospital.type === 'GOVERNMENT' ? 'bg-green-50 text-green-600' : 
                      hospital.type === 'THALASSEMIA_CENTER' ? 'bg-purple-50 text-purple-600' : 
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {hospital.type === 'GOVERNMENT' ? <ShieldAlert size={24} /> : 
                       hospital.type === 'THALASSEMIA_CENTER' ? <Activity size={24} /> : 
                       <Building2 size={24} />}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">{hospital.name}</h3>
                      <p className="text-xs font-bold text-gray-500 flex items-center gap-2 mt-1">
                        <MapPin size={12} /> {hospital.city}, {hospital.division}
                        {hospital.is247 && <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-black">24/7</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        if (onNavigateToRequest) {
                          onNavigateToRequest({
                            name: hospital.name,
                            address: `${hospital.city}, ${hospital.division}`,
                            phone: hospital.phone
                          });
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black hover:bg-red-700 transition-all flex items-center gap-2"
                    >
                      <ExternalLink size={14} /> Request Blood
                    </button>
                  </div>
                </div>
              </div>

              {/* Blood Stock Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(bloodType => {
                    const stock = hospital.bloodStock[bloodType];
                    return (
                      <div 
                        key={bloodType}
                        className={`p-4 rounded-2xl border-2 text-center transition-all hover:scale-105 cursor-pointer ${
                          stock.status === 'CRITICAL' ? 'bg-red-50 border-red-200' :
                          stock.status === 'LOW' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-green-50 border-green-200'
                        }`}
                        onClick={() => setDonateModal({ hospital, bloodGroup: bloodType })}
                      >
                        <div className={`w-12 h-12 mx-auto mb-2 ${bloodColors[bloodType]} text-white rounded-xl flex items-center justify-center font-black shadow-lg`}>
                          {bloodType}
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stock.quantity}</p>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Units</p>
                        <div className={`mt-2 px-2 py-1 rounded-lg text-[8px] font-black uppercase ${
                          stock.status === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                          stock.status === 'LOW' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {stock.status}
                        </div>
                        <button 
                          className="mt-2 w-full bg-white border border-gray-200 text-gray-700 py-1 rounded-lg text-[10px] font-black hover:bg-gray-50 transition-all flex items-center justify-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDonateModal({ hospital, bloodGroup: bloodType });
                          }}
                        >
                          <Heart size={10} /> Donate
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Phone size={12} /> {hospital.phone}
                    <span className="mx-2">•</span>
                    <Mail size={12} /> {hospital.email}
                  </div>
                  <span className="text-gray-400 font-bold">
                    <Clock size={12} className="inline mr-1" />
                    {getTimeAgo(hospital.lastUpdated)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Donate Modal */}
      {donateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">
            {donateSuccess ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">{labels.success[language]}</h3>
                <p className="text-gray-600 font-medium">{labels.thankYou[language]}</p>
              </div>
            ) : (
              <>
                <div className="bg-red-600 p-8 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black">{labels.donate[language]}</h3>
                    <p className="text-red-100 text-sm font-medium mt-1">{donateModal.hospital.name}</p>
                  </div>
                  <button onClick={() => setDonateModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-8">
                  <div className="text-center mb-8">
                    <div className={`w-24 h-24 mx-auto mb-4 ${bloodColors[donateModal.bloodGroup]} text-white rounded-3xl flex items-center justify-center font-black text-3xl shadow-2xl`}>
                      {donateModal.bloodGroup}
                    </div>
                    <p className="text-sm font-bold text-gray-500">
                      Current Stock: <span className="text-gray-900">{donateModal.hospital.bloodStock[donateModal.bloodGroup].quantity} Units</span>
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-blue-600 shrink-0" size={20} />
                      <div className="text-xs text-blue-900 font-medium leading-relaxed">
                        <p className="font-black mb-1">Important:</p>
                        <ul className="space-y-1">
                          <li>• You must not have donated in the last 120 days</li>
                          <li>• You will receive +50 reward points</li>
                          <li>• Hospital will contact you for appointment</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setDonateModal(null)}
                      className="py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-black hover:bg-gray-50 transition-all"
                    >
                      {labels.cancel[language]}
                    </button>
                    <button 
                      onClick={handleDonate}
                      disabled={donating}
                      className="py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {donating ? (
                        <RefreshCw size={20} className="animate-spin" />
                      ) : (
                        <>
                          <Heart size={20} />
                          {labels.confirmDonate[language]}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Mock data generator
function getMockHospitals(): Hospital[] {
  const hospitals = [
    {
      id: 'h1',
      name: 'Dhaka Medical College Hospital',
      type: 'GOVERNMENT' as const,
      city: 'Dhaka',
      division: 'Dhaka',
      phone: '+880255165088',
      email: 'info@dmch.gov.bd',
      is247: true
    },
    {
      id: 'h2',
      name: 'Square Hospital Ltd',
      type: 'PRIVATE' as const,
      city: 'Dhaka',
      division: 'Dhaka',
      phone: '10616',
      email: 'info@squarehospital.com',
      is247: true
    },
    {
      id: 'h3',
      name: 'Bangladesh Thalassemia Foundation',
      type: 'THALASSEMIA_CENTER' as const,
      city: 'Dhaka',
      division: 'Dhaka',
      phone: '+8801730434771',
      email: 'btf.bd@gmail.com',
      is247: false
    }
  ];

  return hospitals.map(h => ({
    ...h,
    bloodStock: {
      'A+': { quantity: Math.floor(Math.random() * 150), status: getStatus(Math.floor(Math.random() * 150)), expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() },
      'A-': { quantity: Math.floor(Math.random() * 50), status: getStatus(Math.floor(Math.random() * 50)), expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() },
      'B+': { quantity: Math.floor(Math.random() * 150), status: getStatus(Math.floor(Math.random() * 150)), expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString() },
      'B-': { quantity: Math.floor(Math.random() * 50), status: getStatus(Math.floor(Math.random() * 50)), expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString() },
      'AB+': { quantity: Math.floor(Math.random() * 100), status: getStatus(Math.floor(Math.random() * 100)), expiryDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString() },
      'AB-': { quantity: Math.floor(Math.random() * 40), status: getStatus(Math.floor(Math.random() * 40)), expiryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString() },
      'O+': { quantity: Math.floor(Math.random() * 150), status: getStatus(Math.floor(Math.random() * 150)), expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString() },
      'O-': { quantity: Math.floor(Math.random() * 50), status: getStatus(Math.floor(Math.random() * 50)), expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() }
    } as Hospital['bloodStock'],
    lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString()
  }));
}

function getStatus(quantity: number): 'CRITICAL' | 'LOW' | 'OPTIMAL' {
  if (quantity < 10) return 'CRITICAL';
  if (quantity < 30) return 'LOW';
  return 'OPTIMAL';
}

export default Inventory;