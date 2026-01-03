import React, { useState } from 'react';
import { Calendar, Clock, Building2, Droplet, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { User, BloodGroup } from '../types';
import { createAppointment } from '../services/appointmentService';

interface AppointmentBookingProps {
  language: 'en' | 'bn';
  user: User;
  prefillData?: {
    hospitalId?: string;
    hospitalName?: string;
    hospitalAddress?: string;
    hospitalPhone?: string;
    bloodGroup?: BloodGroup;
  };
  onSuccess?: () => void;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ 
  language, 
  user, 
  prefillData,
  onSuccess 
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    hospitalId: prefillData?.hospitalId || '',
    hospitalName: prefillData?.hospitalName || '',
    hospitalAddress: prefillData?.hospitalAddress || '',
    hospitalPhone: prefillData?.hospitalPhone || '',
    bloodGroup: prefillData?.bloodGroup || user.bloodGroup,
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      // Validation
      if (!formData.hospitalName.trim()) {
        throw new Error(language === 'en' ? 'Hospital name is required' : 'হাসপাতালের নাম প্রয়োজন');
      }
      if (!formData.appointmentDate) {
        throw new Error(language === 'en' ? 'Appointment date is required' : 'অ্যাপয়েন্টমেন্ট তারিখ প্রয়োজন');
      }
      if (!formData.appointmentTime) {
        throw new Error(language === 'en' ? 'Appointment time is required' : 'অ্যাপয়েন্টমেন্ট সময় প্রয়োজন');
      }

      // Check if date is in future
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        throw new Error(language === 'en' ? 'Appointment date must be in the future' : 'অ্যাপয়েন্টমেন্ট তারিখ ভবিষ্যতে হতে হবে');
      }

      // Generate hospitalId if not provided
      const appointmentData = {
        ...formData,
        hospitalId: formData.hospitalId || `hospital-${formData.hospitalName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        hospitalAddress: formData.hospitalAddress || 'N/A',
        hospitalPhone: formData.hospitalPhone || 'N/A'
      };

      await createAppointment(appointmentData);
      
      setSuccess(true);
      
      // Reset form after 2 seconds and call onSuccess
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          hospitalId: '',
          hospitalName: '',
          hospitalAddress: '',
          hospitalPhone: '',
          bloodGroup: user.bloodGroup,
          appointmentDate: '',
          appointmentTime: '',
          notes: ''
        });
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);

    } catch (error: any) {
      console.error('Appointment booking error:', error);
      setErrorMsg(error.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const labels = {
    title: { en: 'Book Appointment', bn: 'অ্যাপয়েন্টমেন্ট বুক করুন' },
    subtitle: { en: 'Schedule your blood donation', bn: 'আপনার রক্তদান নির্ধারণ করুন' },
    hospitalInfo: { en: 'Hospital Information', bn: 'হাসপাতালের তথ্য' },
    appointmentDetails: { en: 'Appointment Details', bn: 'অ্যাপয়েন্টমেন্ট বিবরণ' },
    hospitalName: { en: 'Hospital Name', bn: 'হাসপাতালের নাম' },
    hospitalAddress: { en: 'Hospital Address', bn: 'হাসপাতালের ঠিকানা' },
    hospitalPhone: { en: 'Hospital Phone', bn: 'হাসপাতালের ফোন' },
    bloodGroup: { en: 'Blood Group', bn: 'রক্তের গ্রুপ' },
    appointmentDate: { en: 'Appointment Date', bn: 'অ্যাপয়েন্টমেন্ট তারিখ' },
    appointmentTime: { en: 'Appointment Time', bn: 'অ্যাপয়েন্টমেন্ট সময়' },
    notes: { en: 'Additional Notes', bn: 'অতিরিক্ত নোট' },
    submit: { en: 'Book Appointment', bn: 'অ্যাপয়েন্টমেন্ট বুক করুন' },
    submitting: { en: 'Booking...', bn: 'বুক করা হচ্ছে...' },
    successTitle: { en: 'Appointment Booked!', bn: 'অ্যাপয়েন্টমেন্ট বুক হয়েছে!' },
    successMsg: { en: 'Your appointment has been scheduled successfully. Check "My Appointments" section.', bn: 'আপনার অ্যাপয়েন্টমেন্ট সফলভাবে নির্ধারিত হয়েছে। "আমার অ্যাপয়েন্টমেন্ট" বিভাগ চেক করুন।' }
  };

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM'
  ];

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Calendar size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black">{labels.title[language]}</h1>
              <p className="text-blue-100 font-medium">{labels.subtitle[language]}</p>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
              <p className="text-xs font-bold text-blue-100 uppercase">Your Blood Group</p>
              <p className="text-2xl font-black">{user.bloodGroup}</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 opacity-10">
          <Calendar size={300} />
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 flex items-start gap-4 animate-in slide-in-from-top-4">
          <div className="bg-green-500 p-2 rounded-xl">
            <CheckCircle2 className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-green-900 text-lg mb-1">{labels.successTitle[language]}</h3>
            <p className="text-green-700 font-medium">{labels.successMsg[language]}</p>
          </div>
          <button onClick={() => setSuccess(false)} className="text-green-600 hover:text-green-800">
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

      {/* Form */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Hospital Information */}
          <section>
            <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Building2 size={16} /> {labels.hospitalInfo[language]}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.hospitalName[language]} *</label>
                <input 
                  type="text"
                  placeholder="e.g. Dhaka Medical College Hospital"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  required
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.hospitalAddress[language]}</label>
                <input 
                  type="text"
                  placeholder="e.g. Dhaka, Bangladesh"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={formData.hospitalAddress}
                  onChange={(e) => setFormData({...formData, hospitalAddress: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.hospitalPhone[language]}</label>
                <input 
                  type="tel"
                  placeholder="+8801XXXXXXXXX"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={formData.hospitalPhone}
                  onChange={(e) => setFormData({...formData, hospitalPhone: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* Appointment Details */}
          <section>
            <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Calendar size={16} /> {labels.appointmentDetails[language]}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.bloodGroup[language]} *</label>
                <select 
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold appearance-none cursor-pointer focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({...formData, bloodGroup: e.target.value as BloodGroup})}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.appointmentDate[language]} *</label>
                <input 
                  type="date"
                  min={minDate}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  required
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.appointmentTime[language]} *</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setFormData({...formData, appointmentTime: time})}
                      className={`px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                        formData.appointmentTime === time
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.notes[language]}</label>
                <textarea 
                  placeholder="Any special instructions or health conditions..."
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest text-base"
          >
            {submitting ? (
              <>{labels.submitting[language]}</>
            ) : (
              <>
                <Calendar size={20} />
                {labels.submit[language]}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Info Card */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="bg-yellow-600 p-2 rounded-lg">
            <AlertTriangle className="text-white" size={20} />
          </div>
          <div>
            <h4 className="font-black text-yellow-900 text-sm mb-2">Important Information</h4>
            <ul className="text-xs text-yellow-800 space-y-1 font-medium">
              <li>• You must not have donated blood in the last 120 days</li>
              <li>• Please arrive 15 minutes before your scheduled time</li>
              <li>• Bring a valid ID and eat a healthy meal before donation</li>
              <li>• You will receive +50 reward points after completion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;