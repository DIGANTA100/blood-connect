import { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Real login function that calls backend
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store token in localStorage - CHANGED FROM 'token' to 'jwt_token'
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data.user;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Failed to login. Please check your credentials.');
  }
};

// Real signup function that calls backend
export const signup = async (formData: any): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle validation errors
      if (data.errors && Array.isArray(data.errors)) {
        throw new Error(data.errors.map((e: any) => e.msg).join(', '));
      }
      throw new Error(data.message || 'Signup failed');
    }

    // Store token in localStorage - CHANGED FROM 'token' to 'jwt_token'
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data.user;
  } catch (error: any) {
    console.error('Signup error:', error);
    throw new Error(error.message || 'Failed to create account. Please try again.');
  }
};

// Logout function
export const logout = () => {
  localStorage.removeItem('jwt_token'); // CHANGED FROM 'token' to 'jwt_token'
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('jwt_token'); // CHANGED FROM 'token' to 'jwt_token'
  return !!token;
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Get auth token
export const getToken = (): string | null => {
  return localStorage.getItem('jwt_token'); // CHANGED FROM 'token' to 'jwt_token'
};