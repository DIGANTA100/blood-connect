import React, { useState, useMemo } from 'react';
import { Heart, Mail, Lock, User as UserIcon, Phone, Droplet, Globe, ChevronRight, AlertCircle, Calendar, Scale, MapPin, UserCheck, ShieldAlert, Building2, CheckCircle2 } from 'lucide-react';
import { login, signup } from '../services/authService';
import { User, BloodGroup } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  language: 'en' | 'bn';
  onToggleLanguage: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, language, onToggleLanguage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bloodGroup: 'B+' as BloodGroup,
    dob: '',
    district: 'Dhaka',
    gender: 'Male',
    weight: '',
    lastDonationDate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    preferredCenter: ''
  });

  const passwordStrength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return 0;
    let strength = 0;
    if (pw.length > 7) strength += 25;
    if (/[A-Z]/.test(pw)) strength += 25;
    if (/[0-9]/.test(pw)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pw)) strength += 25;
    return strength;
  }, [formData.password]);

  const validateAge = (dob: string) => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setErrorMsg(null);

  try {
    if (isLogin) {
      // Call real login function
      const user = await login(formData.email, formData.password);
      onLogin(user);
    } else {
      // Validation checks
      if (formData.password !== formData.confirmPassword) {
        throw new Error(language === 'en' ? "Passwords do not match" : "পাসওয়ার্ড মিলছে না");
      }
      if (!validateAge(formData.dob)) {
        throw new Error(language === 'en' ? "You must be at least 18 years old to register" : "নিবন্ধনের জন্য আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে");
      }
      if (Number(formData.weight) < 50) {
        throw new Error(language === 'en' ? "Weight must be at least 50kg to donate" : "রক্তদানের জন্য ওজন কমপক্ষে ৫০ কেজি হতে হবে");
      }
      if (!formData.phone.match(/^\+8801[3-9]\d{8}$/)) {
        throw new Error(language === 'en' ? "Invalid Phone format. Use +8801XXXXXXXXX" : "ফোন নম্বর সঠিক নয়। +8801XXXXXXXXX ব্যবহার করুন");
      }

      // Call real signup function
      const user = await signup(formData);
      onLogin(user);
    }
  } catch (error: any) {
    setErrorMsg(error.message);
  } finally {
    setIsLoading(false);
  }
};
  const labels = {
    title: { en: 'BloodConnect', bn: 'ব্লাডকানেক্ট' },
    subtitle: { en: 'Connecting Donors, Saving Lives', bn: 'রক্তদাতার সাথে গ্রহীতার মেলবন্ধন' },
    login: { en: 'Login', bn: 'লগইন' },
    signup: { en: 'Sign Up', bn: 'নিবন্ধন' },
    fullName: { en: 'Full Name', bn: 'পুরো নাম' },
    email: { en: 'Email Address', bn: 'ইমেইল ঠিকানা' },
    phone: { en: 'Phone (+8801...)', bn: 'ফোন (+8801...)' },
    password: { en: 'Password', bn: 'পাসওয়ার্ড' },
    confirmPass: { en: 'Confirm Password', bn: 'নিশ্চিত পাসওয়ার্ড' },
    bloodGroup: { en: 'Blood Group', bn: 'রক্তের গ্রুপ' },
    dob: { en: 'Date of Birth (18+)', bn: 'জন্ম তারিখ (১৮+)' },
    district: { en: 'District', bn: 'জেলা' },
    gender: { en: 'Gender', bn: 'লিঙ্গ' },
    weight: { en: 'Weight (Min 50kg)', bn: 'ওজন (কমপক্ষে ৫০ কেজি)' },
    lastDonation: { en: 'Last Donation Date', bn: 'সর্বশেষ রক্তদানের তারিখ' },
    emergencyName: { en: 'Emergency Contact Name', bn: 'জরুরী যোগাযোগের ব্যক্তির নাম' },
    emergencyPhone: { en: 'Emergency Contact Phone', bn: 'জরুরী যোগাযোগের ফোন' },
    preferredCenter: { en: 'Preferred Center', bn: 'পছন্দের রক্তদান কেন্দ্র' },
    processing: { en: 'Processing...', bn: 'প্রক্রিয়াকরণ...' },
    noAccount: { en: "Don't have an account?", bn: "অ্যাকাউন্ট নেই?" },
    hasAccount: { en: "Already have an account?", bn: "ইতিমধ্যে অ্যাকাউন্ট আছে?" },
    strength: { en: 'Password Strength', bn: 'পাসওয়ার্ডের শক্তি' }
  };

  const districts = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'];
  const genders = ['Male', 'Female', 'Other'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-6 lg:p-12 overflow-y-auto scroll-smooth">
      <button 
        onClick={onToggleLanguage}
        className="mb-8 flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-black text-gray-700 hover:shadow-md transition-all active:scale-95"
      >
        <Globe size={18} className="text-red-600" />
        {language === 'en' ? 'বাংলা (BN)' : 'English (EN)'}
      </button>

      <div className={`w-full ${isLogin ? 'max-w-md' : 'max-w-4xl'} bg-white rounded-[3rem] shadow-2xl shadow-red-100/40 border border-gray-100 transition-all duration-500`}>
        <div className="p-8 sm:p-12">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="bg-red-600 p-5 rounded-3xl shadow-2xl shadow-red-200 mb-6 transition-transform hover:scale-110">
              <Heart className="text-white" size={40} fill="white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{labels.title[language]}</h1>
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">{labels.subtitle[language]}</p>
          </div>

          <div className="flex bg-gray-100/80 p-2 rounded-2xl mb-10">
            <button 
              onClick={() => { setIsLogin(true); setErrorMsg(null); }}
              className={`flex-1 py-4 text-sm font-black rounded-xl transition-all duration-300 ${isLogin ? 'bg-white text-red-600 shadow-xl' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {labels.login[language]}
            </button>
            <button 
              onClick={() => { setIsLogin(false); setErrorMsg(null); }}
              className={`flex-1 py-4 text-sm font-black rounded-xl transition-all duration-300 ${!isLogin ? 'bg-white text-red-600 shadow-xl' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {labels.signup[language]}
            </button>
          </div>

          {errorMsg && (
            <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 text-red-600 animate-in slide-in-from-top-4">
              <AlertCircle size={24} className="shrink-0 mt-0.5" />
              <p className="text-sm font-bold leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isLogin ? (
              <div className="space-y-5">
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" size={20} />
                  <input 
                    type="email" 
                    placeholder={labels.email[language]}
                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all placeholder:text-gray-400"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" size={20} />
                  <input 
                    type="password" 
                    placeholder={labels.password[language]}
                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-200 text-gray-900 font-bold rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all placeholder:text-gray-400"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                <div className="lg:col-span-2">
                  <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <UserIcon size={16} /> {language === 'en' ? '1. Account Credentials' : '১. অ্যাকাউন্টের তথ্য'}
                  </h3>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.fullName[language]}</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" size={20} />
                    <input 
                      type="text" placeholder="John Doe"
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.email[language]}</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" size={20} />
                    <input 
                      type="email" placeholder="example@mail.com"
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.phone[language]}</label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" size={20} />
                    <input 
                      type="tel" placeholder="+8801XXXXXXXXX"
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.district[language]}</label>
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" size={20} />
                    <select 
                      className="w-full pl-14 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 font-bold appearance-none outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all cursor-pointer"
                      value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})}
                    >
                      {districts.map(d => <option key={d} value={d} className="text-gray-900">{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.password[language]}</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" size={20} />
                    <input 
                      type="password" placeholder="••••••••"
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  {formData.password && (
                    <div className="px-2 mt-2">
                      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                        <span className="text-gray-400">{labels.strength[language]}</span>
                        <span className={passwordStrength > 75 ? 'text-green-600' : passwordStrength > 40 ? 'text-yellow-600' : 'text-red-600'}>
                          {passwordStrength}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${passwordStrength > 75 ? 'bg-green-500' : passwordStrength > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.confirmPass[language]}</label>
                  <div className="relative group">
                    <ShieldAlert className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" size={20} />
                    <input 
                      type="password" placeholder="••••••••"
                      className={`w-full pl-14 pr-6 py-4 bg-gray-50 border rounded-2xl text-base text-gray-900 font-bold outline-none transition-all focus:ring-4 focus:ring-red-500/10 ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500' : 'border-gray-200 focus:border-red-500'}`}
                      required value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>

                <div className="lg:col-span-2 mt-6">
                  <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Droplet size={16} /> {language === 'en' ? '2. Medical & Health Record' : '২. মেডিকেল এবং স্বাস্থ্য তথ্য'}
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.bloodGroup[language]}</label>
                  <div className="relative group">
                    <Droplet className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" size={20} />
                    <select 
                      className="w-full pl-14 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 font-bold appearance-none outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all cursor-pointer"
                      value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value as BloodGroup})}
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g} className="text-gray-900">{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.dob[language]}</label>
                  <div className="relative group">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" size={20} />
                    <input 
                      type="date" 
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      required value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.gender[language]}</label>
                  <div className="relative group">
                    <UserCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" size={20} />
                    <select 
                      className="w-full pl-14 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 font-bold appearance-none outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all cursor-pointer"
                      value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      {genders.map(g => <option key={g} value={g} className="text-gray-900">{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.weight[language]}</label>
                  <div className="relative group">
                    <Scale className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" size={20} />
                    <input 
                      type="number" placeholder="55"
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      required value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.lastDonation[language]}</label>
                  <div className="relative group">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" size={20} />
                    <input 
                      type="date" 
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      value={formData.lastDonationDate} onChange={(e) => setFormData({...formData, lastDonationDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.preferredCenter[language]}</label>
                  <div className="relative group">
                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" size={20} />
                    <input 
                      type="text" placeholder="e.g. Dhaka Medical College"
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      value={formData.preferredCenter} onChange={(e) => setFormData({...formData, preferredCenter: e.target.value})}
                    />
                  </div>
                </div>

                <div className="lg:col-span-2 mt-6">
                  <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldAlert size={16} /> {language === 'en' ? '3. Emergency Contact' : '৩. জরুরী যোগাযোগ'}
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.emergencyName[language]}</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" size={20} />
                    <input 
                      type="text" placeholder="Relative's Name"
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      value={formData.emergencyContactName} onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.emergencyPhone[language]}</label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" size={20} />
                    <input 
                      type="tel" placeholder="+8801XXXXXXXXX"
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                      value={formData.emergencyContactPhone} onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6">
              <button 
                disabled={isLoading}
                type="submit"
                className="w-full bg-red-600 text-white py-5 rounded-[2rem] font-black shadow-2xl shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group uppercase tracking-widest text-base"
              >
                {isLoading ? labels.processing[language] : (
                  <>
                    {isLogin ? labels.login[language] : labels.signup[language]}
                    <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm font-bold text-gray-400">
              {isLogin ? labels.noAccount[language] : labels.hasAccount[language]}
              <button 
                onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); window.scrollTo(0, 0); }}
                className="ml-2 text-red-600 font-black hover:text-red-700 transition-colors underline decoration-2 underline-offset-8"
              >
                {isLogin ? labels.signup[language] : labels.login[language]}
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 mb-12 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
          <CheckCircle2 size={12} />
          {language === 'en' ? 'Verified Security • HIPAA Compliant' : 'ভেরিফাইড নিরাপত্তা • HIPAA কমপ্লায়েন্ট'}
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
          {language === 'en' 
            ? '© 2025 BloodConnect Bangladesh • A Social Health Initiative' 
            : '© ২০২৫ ব্লাডকানেক্ট বাংলাদেশ • একটি সামাজিক স্বাস্থ্য উদ্যোগ'}
        </p>
      </div>
    </div>
  );
};

export default Auth;