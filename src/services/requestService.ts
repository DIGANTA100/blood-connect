import { BloodGroup } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface CreateRequestData {
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  urgency: 'EMERGENCY' | 'URGENT' | 'NORMAL';
  hospitalName: string;
  address: string;
  contactPhone: string;
  patientName: string;
  relationship?: string;
  additionalNotes?: string;
  isThalassemiaPatient: boolean;
  location: {
    lat: number;
    lng: number;
  };
}

/**
 * Create a new blood request
 */
export const createBloodRequest = async (data: CreateRequestData) => {
  const token = localStorage.getItem('jwt_token');
  
  const response = await fetch(`${API_URL}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify({
      bloodGroup: data.bloodGroup,
      unitsNeeded: data.unitsNeeded,
      urgency: data.urgency,
      hospitalName: data.hospitalName,
      location: {
        lat: data.location?.lat || 23.8103, // Use provided coordinates or default to Dhaka
        lng: data.location?.lng || 90.4125,
        address: data.address
      },
      contactPhone: data.contactPhone,
      patientName: data.patientName,
      relationship: data.relationship,
      additionalNotes: data.additionalNotes,
      isThalassemiaPatient: data.isThalassemiaPatient,
      status: 'OPEN'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create request');
  }

  return response.json();
};

/**
 * Get current user's blood requests
 */
export const getMyRequests = async () => {
  const token = localStorage.getItem('jwt_token');
  
  try {
    const response = await fetch(`${API_URL}/requests/my-requests`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch requests');
    }

    return response.json();
  } catch (error) {
    console.error('Get my requests error:', error);
    return [];
  }
};

/**
 * Cancel a blood request
 */
export const cancelRequest = async (requestId: string) => {
  const token = localStorage.getItem('jwt_token');
  
  const response = await fetch(`${API_URL}/requests/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify({ status: 'CANCELLED' })
  });

  if (!response.ok) {
    throw new Error('Failed to cancel request');
  }

  return response.json();
};

/**
 * Accept/Fulfill a blood request
 */
export const acceptRequest = async (requestId: string) => {
  const token = localStorage.getItem('jwt_token');
  
  const response = await fetch(`${API_URL}/requests/${requestId}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to accept request');
  }

  return response.json();
};