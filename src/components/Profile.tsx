
import React from 'react';
import { User as UserIcon, Mail, Phone, Droplet, MapPin, Calendar, Award, ShieldCheck, Scale, Heart, Building2 } from 'lucide-react';

import { User } from '../types';

interface ProfileProps {
  user: User;
  language: 'en' | 'bn';
}

const Profile: React.FC<ProfileProps> = ({ user, language }) => {
  const labels = {
    title: { en: 'My Profile', bn: 'আমার প্রোফাইল' },
    personalInfo: { en: 'Personal Information', bn: 'ব্যক্তিগত তথ্য' },
    medicalInfo: { en: 'Medical Record', bn: 'মেডিকেল রেকর্ড' },
    emergencyInfo: { en: 'Emergency Contact', bn: 'জরুরী যোগাযোগ' },
    status: { en: 'Active Donor', bn: 'সক্রিয় রক্তদাতা' },
    verified: { en: 'Verified Account', bn: 'ভেরিফাইড অ্যাকাউন্ট' },
    points: { en: 'Reward Points', bn: 'রিওয়ার্ড পয়েন্ট' },
    lastDonation: { en: 'Last Donation', bn: 'সর্বশেষ রক্তদান' },
    location: { en: 'Location', bn: 'অবস্থান' },
    weight: { en: 'Weight', bn: 'ওজন' },
    dob: { en: 'Date of Birth', bn: 'জন্ম তারিখ' },
    preferredCenter: { en: 'Preferred Center', bn: 'পছন্দের কেন্দ্র' }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header Profile Card */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-red-50 border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-red-600 to-red-500"></div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col items-center -mt-16 mb-6">
            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-xl">
              <div className="w-full h-full bg-red-100 rounded-full flex items-center justify-center text-red-600 border-4 border-white">
                <UserIcon size={64} />
              </div>
            </div>
            <div className="absolute bottom-2 right-[calc(50%-60px)] bg-green-500 border-4 border-white w-8 h-8 rounded-full flex items-center justify-center text-white">
              <ShieldCheck size={16} />
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-black text-gray-900">{user.name}</h1>
            <p className="text-gray-500 font-medium flex items-center justify-center gap-2 mt-1">
              <Droplet size={16} className="text-red-600" />
              {user.bloodGroup} Donor • {labels.verified[language]}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{labels.points[language]}</p>
              <p className="text-2xl font-black text-red-600">{user.points}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{labels.lastDonation[language]}</p>
              <p className="text-lg font-bold text-gray-800">{user.lastDonationDate || (language === 'en' ? 'None yet' : 'এখনো হয়নি')}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100 col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{labels.status[language]}</p>
              <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <UserIcon size={24} className="text-red-600" />
            {labels.personalInfo[language]}
          </h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</p>
                <p className="text-gray-800 font-bold">{user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone</p>
                <p className="text-gray-800 font-bold">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{labels.location[language]}</p>
                <p className="text-gray-800 font-bold">{user.district || 'Dhaka'}, Bangladesh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Stats */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <ShieldCheck size={24} className="text-green-600" />
            {labels.medicalInfo[language]}
          </h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{labels.dob[language]}</p>
                <p className="text-gray-800 font-bold">{user.dob} (Age: {calculateAge(user.dob)})</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                <Scale size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{labels.weight[language]}</p>
                <p className="text-gray-800 font-bold">{user.weight} kg</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{labels.preferredCenter[language]}</p>
                <p className="text-gray-800 font-bold">{user.preferredCenter || 'Any available center'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3 text-red-600">
            <Heart size={24} fill="currentColor" />
            {labels.emergencyInfo[language]}
          </h3>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Name</p>
              <p className="text-gray-800 font-bold text-lg">{user.emergencyContactName || 'Not Provided'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Relationship</p>
              <p className="text-gray-800 font-medium">Guardian / Next of Kin</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone</p>
              <p className="text-gray-800 font-bold text-lg">{user.emergencyContactPhone || 'Not Provided'}</p>
            </div>
          </div>
        </div>

        {/* Gamification / Awards */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Award size={24} className="text-yellow-600" />
            Achievements
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 text-center opacity-50 grayscale">
              <Award className="mx-auto mb-2 text-yellow-600" size={32} />
              <p className="text-xs font-bold text-yellow-800">First Blood</p>
              <p className="text-[10px] text-yellow-600 font-black uppercase">Locked</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-center opacity-50 grayscale">
              <Calendar className="mx-auto mb-2 text-purple-600" size={32} />
              <p className="text-xs font-bold text-purple-800">Life Saver</p>
              <p className="text-[10px] text-purple-600 font-black uppercase">Locked</p>
            </div>
          </div>
          <div className="mt-8 p-4 bg-gray-50 rounded-2xl text-center">
            <p className="text-sm text-gray-500 font-bold italic">
              {language === 'en' 
                ? 'Donate blood once to start earning badges!' 
                : 'ব্যাজ অর্জন শুরু করতে একবার রক্ত দিন!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
