import React, { useState, useEffect, useRef } from 'react';
import { Droplet, MapPin, Phone, Clock, AlertTriangle, Send, CheckCircle2, X, Calendar, Building, User as UserIcon, Navigation2, Search, Crosshair } from 'lucide-react';
import { BloodGroup, User } from '../types';
import { createBloodRequest, getMyRequests, cancelRequest } from '../services/requestService';

declare const L: any;

interface RequestBloodProps {
  language: 'en' | 'bn';
  user: User;
  prefillData?: {
    hospitalName?: string;
    address?: string;
    contactPhone?: string;
  };
}

interface MyRequest {
  id: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  urgency: 'EMERGENCY' | 'URGENT' | 'NORMAL';
  hospitalName: string;
  location: {
    address: string;
  };
  contactPhone: string;
  status: 'OPEN' | 'FULFILLED' | 'CANCELLED';
  createdAt: string;
}

const RequestBlood: React.FC<RequestBloodProps> = ({ language, user, prefillData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [myRequests, setMyRequests] = useState<MyRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [formData, setFormData] = useState({
    bloodGroup: 'A+' as BloodGroup,
    unitsNeeded: 1,
    urgency: 'URGENT' as 'EMERGENCY' | 'URGENT' | 'NORMAL',
    hospitalName: prefillData?.hospitalName || '',
    address: prefillData?.address || '',
    contactPhone: prefillData?.contactPhone || user.phone || '',
    patientName: '',
    relationship: '',
    additionalNotes: '',
    isThalassemiaPatient: false,
    location: {
      lat: 0,
      lng: 0
    }
  });

  const [geocodingAddress, setGeocodingAddress] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const marker = useRef<any>(null);

  // Update form if prefillData changes
  useEffect(() => {
    if (prefillData) {
      setFormData(prev => ({
        ...prev,
        hospitalName: prefillData.hospitalName || prev.hospitalName,
        address: prefillData.address || prev.address,
        contactPhone: prefillData.contactPhone || prev.contactPhone
      }));
    }
  }, [prefillData]);

  useEffect(() => {
    loadMyRequests();
  }, []);

  // Geocode address to get coordinates
  const geocodeAddress = async (address: string) => {
    if (!address.trim()) {
      setErrorMsg(language === 'en' ? 'Please enter an address first' : 'অনুগ্রহ করে প্রথমে একটি ঠিকানা লিখুন');
      return;
    }

    setGeocodingAddress(true);
    setErrorMsg(null);

    try {
      // Use Nominatim (OpenStreetMap) geocoding service - free and no API key needed
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Bangladesh')}&limit=1`,
        {
          headers: {
            'User-Agent': 'BloodConnect App'
          }
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        
        setFormData(prev => ({
          ...prev,
          location: { lat, lng }
        }));

        // Update map if open
        if (showMapPicker && leafletMap.current) {
          updateMapMarker(lat, lng);
        }
      } else {
        throw new Error(language === 'en' 
          ? 'Could not find this location. Please try a more specific address or use the map picker.' 
          : 'এই অবস্থান পাওয়া যায়নি। অনুগ্রহ করে আরও নির্দিষ্ট ঠিকানা ব্যবহার করুন বা মানচিত্র নির্বাচক ব্যবহার করুন।');
      }
    } catch (error: any) {
      setErrorMsg(error.message || (language === 'en' 
        ? 'Failed to geocode address. Please try using the map picker.' 
        : 'ঠিকানা জিওকোড করতে ব্যর্থ। অনুগ্রহ করে মানচিত্র নির্বাচক ব্যবহার করুন।'));
    } finally {
      setGeocodingAddress(false);
    }
  };

  // Use current location for hospital
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg(language === 'en' 
        ? 'Geolocation is not supported by your browser' 
        : 'আপনার ব্রাউজার দ্বারা জিওলোকেশন সমর্থিত নয়');
      return;
    }

    setGeocodingAddress(true);
    setErrorMsg(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setFormData(prev => ({
          ...prev,
          location: { lat, lng }
        }));

        // Reverse geocode to get address
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          {
            headers: {
              'User-Agent': 'BloodConnect App'
            }
          }
        )
          .then(res => res.json())
          .then(data => {
            if (data.display_name) {
              setFormData(prev => ({
                ...prev,
                address: data.display_name.split(',').slice(0, 3).join(',').trim()
              }));
            }
          })
          .catch(() => {});

        if (showMapPicker && leafletMap.current) {
          updateMapMarker(lat, lng);
        }
        
        setGeocodingAddress(false);
      },
      (error) => {
        setErrorMsg(language === 'en' 
          ? 'Could not get your location. Please enable location access or use the map picker.' 
          : 'আপনার অবস্থান পাওয়া যায়নি। অনুগ্রহ করে অবস্থান অ্যাক্সেস সক্ষম করুন বা মানচিত্র নির্বাচক ব্যবহার করুন।');
        setGeocodingAddress(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  };

  // Update map marker
  const updateMapMarker = React.useCallback((lat: number, lng: number) => {
    if (!leafletMap.current) return;

    if (marker.current) {
      leafletMap.current.removeLayer(marker.current);
    }

    const icon = L.divIcon({
      className: 'hospital-location-marker',
      html: `<div style="width: 30px; height: 30px; background: #dc2626; border: 4px solid white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 15px rgba(220, 38, 38, 0.6);"></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    marker.current = L.marker([lat, lng], { icon })
      .addTo(leafletMap.current)
      .bindPopup(`<div class="p-2"><strong>${language === 'en' ? 'Hospital Location' : 'হাসপাতালের অবস্থান'}</strong><br>${lat.toFixed(6)}, ${lng.toFixed(6)}</div>`)
      .openPopup();

    leafletMap.current.setView([lat, lng], 15);
  }, [language]);

  // Initialize map picker
  useEffect(() => {
    if (!showMapPicker || !mapRef.current || leafletMap.current) return;

    // Initialize map
    leafletMap.current = L.map(mapRef.current).setView([23.8103, 90.4125], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(leafletMap.current);

    // Add click handler to set location
    const handleMapClick = (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      setFormData(prev => ({
        ...prev,
        location: { lat, lng }
      }));

      updateMapMarker(lat, lng);

      // Reverse geocode
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'BloodConnect App'
          }
        }
      )
        .then(res => res.json())
        .then(data => {
          if (data.display_name) {
            setFormData(prev => ({
              ...prev,
              address: data.display_name.split(',').slice(0, 3).join(',').trim()
            }));
          }
        })
        .catch(() => {});
    };

    leafletMap.current.on('click', handleMapClick);

    // If location is already set, show marker
    if (formData.location.lat !== 0 && formData.location.lng !== 0) {
      setTimeout(() => {
        updateMapMarker(formData.location.lat, formData.location.lng);
      }, 100);
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.off('click', handleMapClick);
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [showMapPicker, updateMapMarker, formData.location.lat, formData.location.lng]);

  const loadMyRequests = async () => {
    try {
      const requests = await getMyRequests();
      setMyRequests(requests);
    } catch (error) {
      console.error('Load requests error:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Validation
      if (!formData.hospitalName.trim()) {
        throw new Error(language === 'en' ? 'Hospital name is required' : 'হাসপাতালের নাম প্রয়োজন');
      }
      if (!formData.address.trim()) {
        throw new Error(language === 'en' ? 'Address is required' : 'ঠিকানা প্রয়োজন');
      }
      if (!formData.patientName.trim()) {
        throw new Error(language === 'en' ? 'Patient name is required' : 'রোগীর নাম প্রয়োজন');
      }
      if (formData.unitsNeeded < 1 || formData.unitsNeeded > 10) {
        throw new Error(language === 'en' ? 'Units needed must be between 1-10' : 'ইউনিট ১-১০ এর মধ্যে হতে হবে');
      }
      if (formData.location.lat === 0 || formData.location.lng === 0) {
        throw new Error(language === 'en' 
          ? 'Please set the hospital location by clicking "Find Location" or using the map picker' 
          : 'অনুগ্রহ করে "অবস্থান খুঁজুন" ক্লিক করে বা মানচিত্র নির্বাচক ব্যবহার করে হাসপাতালের অবস্থান সেট করুন');
      }

      await createBloodRequest(formData);
      
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        ...formData,
        hospitalName: '',
        address: '',
        patientName: '',
        relationship: '',
        additionalNotes: '',
        unitsNeeded: 1,
        urgency: 'URGENT',
        isThalassemiaPatient: false,
        location: { lat: 0, lng: 0 }
      });

      // Clear map marker if picker is open
      if (marker.current && leafletMap.current) {
        leafletMap.current.removeLayer(marker.current);
        marker.current = null;
      }

      // Reload requests
      loadMyRequests();

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);

    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm(language === 'en' ? 'Are you sure you want to cancel this request?' : 'আপনি কি এই অনুরোধটি বাতিল করতে চান?')) {
      return;
    }

    try {
      await cancelRequest(requestId);
      loadMyRequests();
    } catch (error) {
      alert(language === 'en' ? 'Failed to cancel request' : 'অনুরোধ বাতিল করতে ব্যর্থ');
    }
  };

  const labels = {
    title: { en: 'Request Blood', bn: 'রক্তের অনুরোধ' },
    subtitle: { en: 'Submit an urgent blood requirement', bn: 'জরুরী রক্তের প্রয়োজনীয়তা জমা দিন' },
    patientInfo: { en: 'Patient Information', bn: 'রোগীর তথ্য' },
    requestDetails: { en: 'Request Details', bn: 'অনুরোধের বিবরণ' },
    locationInfo: { en: 'Location & Contact', bn: 'অবস্থান এবং যোগাযোগ' },
    patientName: { en: 'Patient Name', bn: 'রোগীর নাম' },
    relationship: { en: 'Your Relationship', bn: 'আপনার সম্পর্ক' },
    bloodGroup: { en: 'Blood Group Needed', bn: 'প্রয়োজনীয় রক্তের গ্রুপ' },
    unitsNeeded: { en: 'Units Needed', bn: 'প্রয়োজনীয় ইউনিট' },
    urgency: { en: 'Urgency Level', bn: 'জরুরী স্তর' },
    hospitalName: { en: 'Hospital Name', bn: 'হাসপাতালের নাম' },
    address: { en: 'Hospital Address', bn: 'হাসপাতালের ঠিকানা' },
    findLocation: { en: 'Find Location', bn: 'অবস্থান খুঁজুন' },
    useMyLocation: { en: 'Use My Location', bn: 'আমার অবস্থান ব্যবহার করুন' },
    showMap: { en: 'Pick on Map', bn: 'মানচিত্রে নির্বাচন করুন' },
    hideMap: { en: 'Hide Map', bn: 'মানচিত্র লুকান' },
    locationSet: { en: 'Location Set', bn: 'অবস্থান সেট করা হয়েছে' },
    locationRequired: { en: 'Location required to calculate distance', bn: 'দূরত্ব গণনা করতে অবস্থান প্রয়োজন' },
    contactPhone: { en: 'Contact Phone', bn: 'যোগাযোগের ফোন' },
    additionalNotes: { en: 'Additional Notes', bn: 'অতিরিক্ত নোট' },
    thalassemia: { en: 'Thalassemia Patient', bn: 'থ্যালাসেমিয়া রোগী' },
    submit: { en: 'Submit Request', bn: 'অনুরোধ জমা দিন' },
    submitting: { en: 'Submitting...', bn: 'জমা দেওয়া হচ্ছে...' },
    myRequests: { en: 'My Requests', bn: 'আমার অনুরোধ' },
    noRequests: { en: 'No requests yet', bn: 'এখনও কোনো অনুরোধ নেই' },
    cancel: { en: 'Cancel', bn: 'বাতিল' },
    open: { en: 'Open', bn: 'খোলা' },
    fulfilled: { en: 'Fulfilled', bn: 'পূরণ হয়েছে' },
    cancelled: { en: 'Cancelled', bn: 'বাতিল' },
    emergency: { en: 'Emergency', bn: 'জরুরী' },
    urgent: { en: 'Urgent', bn: 'জরুরি' },
    normal: { en: 'Normal', bn: 'সাধারণ' },
    successTitle: { en: 'Request Submitted!', bn: 'অনুরোধ জমা হয়েছে!' },
    successMsg: { en: 'Your blood request has been submitted. Nearby donors will be notified.', bn: 'আপনার রক্তের অনুরোধ জমা দেওয়া হয়েছে। নিকটবর্তী দাতাদের জানানো হবে।' }
  };

  const relationships = ['Self', 'Parent', 'Spouse', 'Child', 'Sibling', 'Friend', 'Other'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-red-200 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Droplet size={32} fill="white" />
            </div>
            <div>
              <h1 className="text-3xl font-black">{labels.title[language]}</h1>
              <p className="text-red-100 font-medium">{labels.subtitle[language]}</p>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
              <p className="text-xs font-bold text-red-100 uppercase">Your Blood Group</p>
              <p className="text-2xl font-black">{user.bloodGroup}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
              <p className="text-xs font-bold text-red-100 uppercase">Active Requests</p>
              <p className="text-2xl font-black">{myRequests.filter(r => r.status === 'OPEN').length}</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 opacity-10">
          <Droplet size={300} fill="white" />
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 flex items-start gap-4 animate-in slide-in-from-top-4">
          <div className="bg-green-500 p-2 rounded-xl">
            <CheckCircle2 className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-green-900 text-lg mb-1">{labels.successTitle[language]}</h3>
            <p className="text-green-700 font-medium">{labels.successMsg[language]}</p>
          </div>
          <button onClick={() => setShowSuccess(false)} className="text-green-600 hover:text-green-800">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="text-red-600" size={24} />
          <div className="flex-1">
            <p className="text-red-800 font-bold">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-600 hover:text-red-800">
            <X size={20} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Patient Information */}
              <section>
                <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <UserIcon size={16} /> {labels.patientInfo[language]}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.patientName[language]} *</label>
                    <input 
                      type="text"
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      required
                      value={formData.patientName}
                      onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.relationship[language]}</label>
                    <select 
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold appearance-none cursor-pointer focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      value={formData.relationship}
                      onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                    >
                      <option value="">Select relationship</option>
                      {relationships.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              {/* Request Details */}
              <section>
                <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Droplet size={16} /> {labels.requestDetails[language]}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.bloodGroup[language]} *</label>
                    <select 
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold appearance-none cursor-pointer focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({...formData, bloodGroup: e.target.value as BloodGroup})}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.unitsNeeded[language]} *</label>
                    <input 
                      type="number"
                      min="1"
                      max="10"
                      placeholder="1-10"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      required
                      value={formData.unitsNeeded}
                      onChange={(e) => setFormData({...formData, unitsNeeded: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.urgency[language]} *</label>
                    <select 
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold appearance-none cursor-pointer focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      value={formData.urgency}
                      onChange={(e) => setFormData({...formData, urgency: e.target.value as any})}
                    >
                      <option value="EMERGENCY">🚨 {labels.emergency[language]}</option>
                      <option value="URGENT">⚠️ {labels.urgent[language]}</option>
                      <option value="NORMAL">✓ {labels.normal[language]}</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-purple-50 border border-purple-200 rounded-2xl hover:bg-purple-100 transition-colors">
                    <input 
                      type="checkbox"
                      checked={formData.isThalassemiaPatient}
                      onChange={(e) => setFormData({...formData, isThalassemiaPatient: e.target.checked})}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                    <span className="text-sm font-black text-purple-900">{labels.thalassemia[language]}</span>
                  </label>
                </div>
              </section>

              {/* Location & Contact */}
              <section>
                <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <MapPin size={16} /> {labels.locationInfo[language]}
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.hospitalName[language]} *</label>
                    <div className="relative">
                     <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="text"
                        placeholder="e.g. Dhaka Medical College Hospital"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                        required
                        value={formData.hospitalName}
                        onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.address[language]} *</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-400" size={20} />
                      <textarea 
                        placeholder="e.g. Bakshibazar, Dhaka - 1000"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all resize-none"
                        required
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                    
                    {/* Location Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => geocodeAddress(formData.address)}
                        disabled={geocodingAddress || !formData.address.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                      >
                        <Search size={16} />
                        {geocodingAddress ? (language === 'en' ? 'Searching...' : 'খুঁজছি...') : labels.findLocation[language]}
                      </button>
                      
                      <button
                        type="button"
                        onClick={useCurrentLocation}
                        disabled={geocodingAddress}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                      >
                        <Crosshair size={16} />
                        {labels.useMyLocation[language]}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setShowMapPicker(!showMapPicker)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all active:scale-95"
                      >
                        <MapPin size={16} />
                        {showMapPicker ? labels.hideMap[language] : labels.showMap[language]}
                      </button>
                    </div>

                    {/* Location Status */}
                    {formData.location.lat !== 0 && formData.location.lng !== 0 ? (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <CheckCircle2 className="text-green-600" size={18} />
                        <span className="text-xs font-bold text-green-800">
                          {labels.locationSet[language]}: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <AlertTriangle className="text-yellow-600" size={18} />
                        <span className="text-xs font-bold text-yellow-800">{labels.locationRequired[language]}</span>
                      </div>
                    )}

                    {/* Map Picker */}
                    {showMapPicker && (
                      <div className="mt-4">
                        <div ref={mapRef} className="w-full h-64 rounded-2xl border-2 border-gray-200 overflow-hidden"></div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                          {language === 'en' 
                            ? 'Click on the map to set the hospital location' 
                            : 'হাসপাতালের অবস্থান সেট করতে মানচিত্রে ক্লিক করুন'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.contactPhone[language]} *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="tel"
                        placeholder="+8801XXXXXXXXX"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                        required
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.additionalNotes[language]}</label>
                    <textarea 
                      placeholder="Any additional information..."
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all resize-none"
                      rows={3}
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white py-5 rounded-[2rem] font-black shadow-2xl shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-base"
              >
                {isSubmitting ? (
                  <>{labels.submitting[language]}</>
                ) : (
                  <>
                    <Send size={20} />
                    {labels.submit[language]}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* My Requests Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-6">
            <h3 className="font-black text-gray-900 text-lg mb-6 flex items-center gap-2">
              <Clock size={20} className="text-red-600" />
              {labels.myRequests[language]}
            </h3>

            {loadingRequests ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Droplet className="text-gray-400" size={24} />
                </div>
                <p className="text-sm font-bold text-gray-400">{labels.noRequests[language]}</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                {myRequests.map(request => (
                  <div 
                    key={request.id}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      request.status === 'OPEN' 
                        ? 'border-red-200 bg-red-50' 
                        : request.status === 'FULFILLED'
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        request.urgency === 'EMERGENCY' 
                          ? 'bg-red-600 text-white' 
                          : request.urgency === 'URGENT'
                          ? 'bg-orange-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}>
                        {request.urgency}
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        request.status === 'OPEN' 
                          ? 'bg-red-100 text-red-700' 
                          : request.status === 'FULFILLED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {labels[request.status.toLowerCase() as keyof typeof labels][language]}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center font-black">
                        {request.bloodGroup}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm">{request.unitsNeeded} Units</p>
                        <p className="text-[10px] font-bold text-gray-500">{request.hospitalName}</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 font-medium mb-3 flex items-center gap-1">
                      <MapPin size={12} />
                      {request.location.address}
                    </p>
                    
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      {request.status === 'OPEN' && (
                        <button 
                          onClick={() => handleCancelRequest(request.id)}
                          className="text-red-600 hover:text-red-700 font-black uppercase"
                        >
                          {labels.cancel[language]}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <AlertTriangle className="text-white" size={20} />
              </div>
              <div>
                <h4 className="font-black text-blue-900 text-sm mb-2">Important Notice</h4>
                <ul className="text-xs text-blue-800 space-y-1 font-medium">
                  <li>• Ensure all information is accurate</li>
                  <li>• Keep your phone accessible</li>
                  <li>• Hospital staff may contact you</li>
                  <li>• Donors will be notified immediately</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestBlood;