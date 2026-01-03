export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type FacilityType = 'GOVERNMENT' | 'PRIVATE' | 'THALASSEMIA_CENTER';

export type StockStatus = 'CRITICAL' | 'LOW' | 'OPTIMAL';

export type UrgencyLevel = 'EMERGENCY' | 'URGENT' | 'NORMAL';

export interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  dob: string;
  district: string;
  gender: string;
  weight: string;
  lastDonationDate?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredCenter?: string;
  points: number;
  isAvailable: boolean;
  role: 'DONOR' | 'ADMIN';
  location?: {
    lat: number;
    lng: number;
  };
}

export interface BloodRequest {
  id: string;
  hospitalName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  urgency: UrgencyLevel;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  contactPhone: string;
  status: 'OPEN' | 'FULFILLED' | 'CANCELLED';
   createdAt?: string;
  timestamp: string;
  isThalassemiaPatient?: boolean;
}

export interface BloodInventory {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalType: FacilityType;
  city: string;
  division: string;
  phone: string;
  email: string;
  is247: boolean;
  bloodType: BloodGroup;
  quantity: number;
  expiryDate: string;
  status: StockStatus;
  lastUpdated: string;
}