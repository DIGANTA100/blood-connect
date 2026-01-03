
import { BloodGroup, BloodInventory } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchAllInventory = async (): Promise<BloodInventory[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory`);
    if (!response.ok) throw new Error('Backend offline');
    return response.json();
  } catch (e) {
    console.warn('Using mock data:', e);
    return getMockInventoryData();
  }
};

export const fetchCriticalShortagesCount = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/critical`);
    if (!response.ok) throw new Error('API Unavailable');
    const data = await response.json();
    return data.count;
  } catch (e) {
    const mock = getMockInventoryData();
    return mock.filter(item => item.status === 'CRITICAL').length;
  }
};
/**
 * POST /api/inventory/update
 */
export const updateBloodStock = async (payload: Partial<BloodInventory>) => {
  const response = await fetch(`${API_BASE_URL}/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Update failed');
  return response.json();
};

const getMockInventoryData = (): BloodInventory[] => {
  const now = new Date();
  
  const getExpiry = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(now.getDate() + daysFromNow);
    return d.toISOString();
  };

  return [
    {
      id: 'inv_1',
      hospitalId: 'hosp_dmc',
      hospitalName: 'Dhaka Medical College Hospital',
      hospitalType: 'GOVERNMENT',
      city: 'Dhaka',
      division: 'Dhaka',
      phone: '+880255165088',
      email: 'info@dmch.gov.bd',
      is247: true,
      bloodType: 'A+',
      quantity: 120,
      expiryDate: getExpiry(15),
      status: 'OPTIMAL',
      lastUpdated: now.toISOString()
    },
    {
      id: 'inv_2',
      hospitalId: 'hosp_square',
      hospitalName: 'Square Hospital Ltd',
      hospitalType: 'PRIVATE',
      city: 'Dhaka',
      division: 'Dhaka',
      phone: '10616',
      email: 'info@squarehospital.com',
      is247: true,
      bloodType: 'O-',
      quantity: 8,
      expiryDate: getExpiry(2),
      status: 'CRITICAL',
      lastUpdated: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: 'inv_3',
      hospitalId: 'hosp_imperial',
      hospitalName: 'Imperial Hospital Chittagong',
      hospitalType: 'PRIVATE',
      city: 'Chittagong',
      division: 'Chittagong',
      phone: '+88031659001',
      email: 'contact@ihcl.com',
      is247: true,
      bloodType: 'B-',
      quantity: 4,
      expiryDate: getExpiry(4),
      status: 'CRITICAL',
      lastUpdated: now.toISOString()
    },
    {
      id: 'inv_4',
      hospitalId: 'hosp_thal_cntr',
      hospitalName: 'Bangladesh Thalassemia Foundation',
      hospitalType: 'THALASSEMIA_CENTER',
      city: 'Dhaka',
      division: 'Dhaka',
      phone: '+8801730434771',
      email: 'btf.bd@gmail.com',
      is247: false,
      bloodType: 'O+',
      quantity: 45,
      expiryDate: getExpiry(28),
      status: 'OPTIMAL',
      lastUpdated: now.toISOString()
    },
    {
      id: 'inv_5',
      hospitalId: 'hosp_shmc',
      hospitalName: 'Shaheed Ziaur Rahman Medical College',
      hospitalType: 'GOVERNMENT',
      city: 'Bogura',
      division: 'Rajshahi',
      phone: '+8805166014',
      email: 'bogura_medical@gov.bd',
      is247: true,
      bloodType: 'AB-',
      quantity: 3,
      expiryDate: getExpiry(1),
      status: 'CRITICAL',
      lastUpdated: now.toISOString()
    }
  ];
};
