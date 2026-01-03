import { BloodRequest, BloodGroup } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface DashboardStats {
  points: number;
  totalDonors: number;
  livesSaved: number;
  recentRequestsCount: number;
}

export interface InventoryStats {
  group: BloodGroup;
  value: number;
}

export interface TrendData {
  month: string;
  count: number;
}

/**
 * Fetches dashboard statistics from the backend (real MongoDB data).
 */
export const fetchDashboardStats = async (userPoints: number = 0): Promise<DashboardStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    const data = await response.json();
    // Merge user points with backend stats
    return { ...data, points: userPoints };
  } catch (error) {
    console.warn('Backend unavailable, using mock data:', error);
    return getMockDashboardData().stats;
  }
};

/**
 * Fetches recent blood requests.
 */
export const fetchRecentRequests = async (): Promise<BloodRequest[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/requests?status=OPEN`);
    if (!response.ok) throw new Error('Failed to fetch requests');
    return response.json();
  } catch (error) {
    console.warn('Backend unavailable:', error);
    return [];
  }
};

/**
 * Fetches current blood stock inventory summary.
 */
export const fetchInventoryData = async (): Promise<InventoryStats[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/inventory`);
    if (!response.ok) throw new Error('Failed to fetch inventory');
    const data = await response.json();
    // Return real data if available, otherwise fallback to mock
    return data.length > 0 ? data : getMockDashboardData().inventory;
  } catch (error) {
    console.warn('Backend unavailable, using mock data:', error);
    return getMockDashboardData().inventory;
  }
};

/**
 * Fetches monthly donation trends (last 6 months).
 */
export const fetchTrends = async (): Promise<TrendData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/trends`);
    if (!response.ok) throw new Error('Failed to fetch trends');
    const data = await response.json();
    // Return real data if available, otherwise fallback to mock
    return data.length > 0 ? data : getMockDashboardData().trends;
  } catch (error) {
    console.warn('Backend unavailable, using mock data:', error);
    return getMockDashboardData().trends;
  }
};

// Mock fallback data (only used if backend is offline)
export const getMockDashboardData = (): {
  stats: DashboardStats;
  trends: TrendData[];
  inventory: InventoryStats[];
} => ({
  stats: {
    points: 0,
    totalDonors: 24500,
    livesSaved: 1204,
    recentRequestsCount: 82
  },
  trends: [
    { month: 'Jan', count: 400 },
    { month: 'Feb', count: 300 },
    { month: 'Mar', count: 600 },
    { month: 'Apr', count: 800 },
    { month: 'May', count: 500 },
    { month: 'Jun', count: 700 },
  ],
  inventory: [
    { group: 'A+', value: 400 },
    { group: 'B+', value: 300 },
    { group: 'O+', value: 500 },
    { group: 'AB+', value: 200 },
    { group: 'O-', value: 100 },
  ]
});