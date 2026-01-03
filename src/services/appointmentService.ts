import { BloodGroup } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DEBUG = true; // Set to false in production

export interface Appointment {
  _id: string;
  donor: string;
  donorName: string;
  donorPhone: string;
  donorBloodGroup: BloodGroup;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalPhone: string;
  bloodGroup: BloodGroup;
  appointmentDate: string;
  appointmentTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes: string;
  reminderSent: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateAppointmentData {
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalPhone: string;
  bloodGroup: BloodGroup;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
  const token = localStorage.getItem('jwt_token');
  if (DEBUG) {
    console.log('🔑 Getting auth token:', token ? `${token.substring(0, 20)}...` : 'NULL');
  }
  return token;
};

/**
 * Create a new appointment
 */
export const createAppointment = async (data: CreateAppointmentData): Promise<Appointment> => {
  const token = getAuthToken();
  
  if (DEBUG) {
    console.log('📋 Creating appointment with data:', data);
    console.log('🌐 API URL:', API_URL);
  }
  
  if (!token) {
    console.error('❌ No authentication token found');
    throw new Error('Authentication required. Please login first.');
  }

  // Generate hospitalId if not provided
  if (!data.hospitalId) {
    data.hospitalId = data.hospitalName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  }

  // Ensure proper date format
  const appointmentData = {
    ...data,
    appointmentDate: new Date(data.appointmentDate).toISOString(),
    hospitalAddress: data.hospitalAddress || 'N/A',
    hospitalPhone: data.hospitalPhone || 'N/A'
  };

  if (DEBUG) {
    console.log('📤 Sending request to:', `${API_URL}/appointments`);
    console.log('📦 Request payload:', appointmentData);
  }

  try {
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });

    if (DEBUG) {
      console.log('📥 Response status:', response.status);
    }

    const result = await response.json();

    if (DEBUG) {
      console.log('📥 Response data:', result);
    }

    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ Authentication failed - Session expired');
        throw new Error('Session expired. Please login again.');
      }
      console.error('❌ Server error:', result.message);
      throw new Error(result.message || 'Failed to create appointment');
    }

    if (DEBUG) {
      console.log('✅ Appointment created successfully:', result.appointment);
    }

    return result.appointment;
  } catch (error: any) {
    console.error('❌ Create appointment error:', error);
    throw new Error(error.message || 'Failed to create appointment. Please try again.');
  }
};

/**
 * Get current user's appointments
 */
export const getMyAppointments = async (): Promise<Appointment[]> => {
  const token = getAuthToken();
  
  if (!token) {
    console.warn('⚠️ No auth token found for getMyAppointments');
    return [];
  }

  if (DEBUG) {
    console.log('📋 Fetching my appointments...');
  }

  try {
    const response = await fetch(`${API_URL}/appointments/my-appointments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ Authentication failed');
        return [];
      }
      throw new Error('Failed to fetch appointments');
    }

    const appointments = await response.json();
    
    if (DEBUG) {
      console.log(`✅ Fetched ${appointments.length} appointments`);
    }

    return appointments;
  } catch (error) {
    console.error('❌ Get appointments error:', error);
    return [];
  }
};

/**
 * Get single appointment by ID
 */
export const getAppointment = async (id: string): Promise<Appointment> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/appointments/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch appointment');
  }

  return response.json();
};

/**
 * Complete an appointment (after donation)
 */
export const completeAppointment = async (id: string): Promise<{ message: string; pointsEarned: number; appointment: Appointment }> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  if (DEBUG) {
    console.log('✅ Completing appointment:', id);
  }

  const response = await fetch(`${API_URL}/appointments/${id}/complete`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to complete appointment');
  }

  if (DEBUG) {
    console.log('✅ Appointment completed:', result);
  }

  return result;
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (id: string): Promise<void> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  if (DEBUG) {
    console.log('❌ Cancelling appointment:', id);
  }

  const response = await fetch(`${API_URL}/appointments/${id}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel appointment');
  }

  if (DEBUG) {
    console.log('✅ Appointment cancelled');
  }
};

/**
 * Update an appointment
 */
export const updateAppointment = async (
  id: string, 
  data: { appointmentDate?: string; appointmentTime?: string; notes?: string }
): Promise<Appointment> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  if (DEBUG) {
    console.log('✏️ Updating appointment:', id, data);
  }

  const response = await fetch(`${API_URL}/appointments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to update appointment');
  }

  if (DEBUG) {
    console.log('✅ Appointment updated:', result.appointment);
  }

  return result.appointment;
};