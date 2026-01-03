import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, CheckCircle2, X, AlertCircle, Edit, Trash2, Building2, RefreshCw } from 'lucide-react';
import { User } from '../types';
import { getMyAppointments, cancelAppointment, completeAppointment, updateAppointment, Appointment } from '../services/appointmentService';

interface AppointmentsProps {
  language: 'en' | 'bn';
  user: User;
  refreshTrigger?: number; // Add this to trigger refresh from parent
}

const Appointments: React.FC<AppointmentsProps> = ({ language, user, refreshTrigger }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [editModal, setEditModal] = useState<Appointment | null>(null);
  const [editData, setEditData] = useState({ appointmentDate: '', appointmentTime: '', notes: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [refreshTrigger]); // Refresh when trigger changes

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getMyAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Load appointments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm(language === 'en' ? 'Are you sure you want to cancel this appointment?' : 'আপনি কি এই অ্যাপয়েন্টমেন্ট বাতিল করতে চান?')) {
      return;
    }

    try {
      await cancelAppointment(id);
      loadAppointments();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm(language === 'en' ? 'Confirm that you have completed this donation?' : 'নিশ্চিত করুন যে আপনি এই দান সম্পন্ন করেছেন?')) {
      return;
    }

    try {
      const result = await completeAppointment(id);
      alert(`${result.message}\nYou earned ${result.pointsEarned} points!`);
      loadAppointments();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const openEditModal = (appointment: Appointment) => {
    setEditModal(appointment);
    setEditData({
      appointmentDate: appointment.appointmentDate.split('T')[0],
      appointmentTime: appointment.appointmentTime,
      notes: appointment.notes
    });
  };

  const handleUpdate = async () => {
    if (!editModal) return;

    setUpdating(true);
    try {
      await updateAppointment(editModal._id, editData);
      setEditModal(null);
      loadAppointments();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status.toLowerCase() === filter;
  });

  const labels = {
    title: { en: 'My Appointments', bn: 'আমার অ্যাপয়েন্টমেন্ট' },
    subtitle: { en: 'Manage your blood donation appointments', bn: 'আপনার রক্তদান অ্যাপয়েন্টমেন্ট পরিচালনা করুন' },
    all: { en: 'All', bn: 'সব' },
    scheduled: { en: 'Scheduled', bn: 'নির্ধারিত' },
    completed: { en: 'Completed', bn: 'সম্পন্ন' },
    cancelled: { en: 'Cancelled', bn: 'বাতিল' },
    noAppointments: { en: 'No appointments yet', bn: 'এখনো কোনো অ্যাপয়েন্টমেন্ট নেই' },
    cancel: { en: 'Cancel', bn: 'বাতিল' },
    markComplete: { en: 'Mark Complete', bn: 'সম্পন্ন চিহ্নিত করুন' },
    edit: { en: 'Edit', bn: 'সম্পাদনা' },
    update: { en: 'Update', bn: 'আপডেট' },
    close: { en: 'Close', bn: 'বন্ধ' },
    date: { en: 'Date', bn: 'তারিখ' },
    time: { en: 'Time', bn: 'সময়' },
    notes: { en: 'Notes', bn: 'নোট' },
    refresh: { en: 'Refresh', bn: 'রিফ্রেশ' }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Calendar size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black">{labels.title[language]}</h1>
              <p className="text-blue-100 font-medium">{labels.subtitle[language]}</p>
            </div>
          </div>
          <button
            onClick={loadAppointments}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 p-3 rounded-xl backdrop-blur-sm transition-all disabled:opacity-50"
            title={labels.refresh[language]}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div className="flex gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
            <p className="text-xs font-bold text-blue-100 uppercase">Total</p>
            <p className="text-2xl font-black">{appointments.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
            <p className="text-xs font-bold text-blue-100 uppercase">Completed</p>
            <p className="text-2xl font-black">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
            <p className="text-xs font-bold text-blue-100 uppercase">Upcoming</p>
            <p className="text-2xl font-black">{appointments.filter(a => a.status === 'SCHEDULED').length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2 overflow-x-auto">
        {(['all', 'scheduled', 'completed', 'cancelled'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {labels[f][language]}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw size={48} className="text-blue-600 animate-spin" />
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-20 text-center">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-gray-400" size={32} />
          </div>
          <h3 className="font-black text-gray-900 text-xl mb-2">{labels.noAppointments[language]}</h3>
          <p className="text-gray-500 font-medium">Book your first donation appointment from the "Book Appointment" section</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAppointments.map(appointment => (
            <div 
              key={appointment._id}
              className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Status Badge */}
              <div className={`px-6 py-3 border-b ${
                appointment.status === 'SCHEDULED' ? 'bg-blue-50 border-blue-100' :
                appointment.status === 'COMPLETED' ? 'bg-green-50 border-green-100' :
                'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                  <span className="text-xs font-bold text-gray-500">
                    {formatDate(appointment.appointmentDate)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Hospital Info */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Building2 size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-gray-900 text-lg leading-tight">{appointment.hospitalName}</h3>
                    {appointment.hospitalAddress && appointment.hospitalAddress !== 'N/A' && (
                      <p className="text-xs font-bold text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {appointment.hospitalAddress}
                      </p>
                    )}
                    {appointment.hospitalPhone && appointment.hospitalPhone !== 'N/A' && (
                      <p className="text-xs font-bold text-gray-500 flex items-center gap-1 mt-1">
                        <Phone size={12} /> {appointment.hospitalPhone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Blood Group */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                    {appointment.bloodGroup}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Donating</p>
                    <p className="text-lg font-black text-gray-900">{appointment.bloodGroup} Blood</p>
                  </div>
                </div>

                {/* Time */}
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                  <Clock size={20} className="text-gray-600" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Appointment Time</p>
                    <p className="text-sm font-black text-gray-900">{appointment.appointmentTime}</p>
                  </div>
                </div>

                {/* Notes */}
                {appointment.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                    <p className="text-xs font-bold text-yellow-900 uppercase mb-1">Notes</p>
                    <p className="text-sm text-yellow-800 font-medium">{appointment.notes}</p>
                  </div>
                )}

                {/* Actions */}
                {appointment.status === 'SCHEDULED' && (
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(appointment)}
                      className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl text-xs font-black hover:bg-gray-200 transition-all"
                    >
                      <Edit size={14} />
                      {labels.edit[language]}
                    </button>
                    <button
                      onClick={() => handleComplete(appointment._id)}
                      className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 transition-all"
                    >
                      <CheckCircle2 size={14} />
                      Complete
                    </button>
                    <button
                      onClick={() => handleCancel(appointment._id)}
                      className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-100 transition-all"
                    >
                      <X size={14} />
                      {labels.cancel[language]}
                    </button>
                  </div>
                )}

                {appointment.status === 'COMPLETED' && appointment.completedAt && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="text-green-600" size={20} />
                    <div>
                      <p className="text-xs font-bold text-green-900">Completed on</p>
                      <p className="text-sm font-black text-green-700">{formatDate(appointment.completedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">Edit Appointment</h3>
                <p className="text-blue-100 text-sm font-medium mt-1">{editModal.hospitalName}</p>
              </div>
              <button onClick={() => setEditModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.date[language]}</label>
                <input
                  type="date"
                  value={editData.appointmentDate}
                  onChange={(e) => setEditData({ ...editData, appointmentDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.time[language]}</label>
                <input
                  type="text"
                  value={editData.appointmentTime}
                  onChange={(e) => setEditData({ ...editData, appointmentTime: e.target.value })}
                  placeholder="e.g. 10:00 AM"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase ml-2">{labels.notes[language]}</label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                  placeholder="Any special instructions..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => setEditModal(null)}
                  className="py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-black hover:bg-gray-50 transition-all"
                >
                  {labels.close[language]}
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <RefreshCw size={20} className="animate-spin" />
                  ) : (
                    labels.update[language]
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;