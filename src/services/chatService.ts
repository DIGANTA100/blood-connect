const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
    bloodGroup?: string;
    isOnline: boolean;
    district?: string;
    phone?: string;
  };
  lastMessage?: {
    content: string;
    timestamp: string;
  };
  unreadCount: number;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  timestamp: string;
}

export interface ChatUser {
  _id: string;  // Changed from id to _id
  name: string;
  email: string;
  bloodGroup: string;
  district: string;
  phone: string;
  isAvailable: boolean;
  points: number;
}

/**
 * Get all users for chat discovery
 */
export const getAllUsers = async (): Promise<ChatUser[]> => {
  const token = localStorage.getItem('jwt_token');
  
  try {
    const response = await fetch(`${API_URL}/chat/users`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  } catch (error) {
    console.error('Get users error:', error);
    return [];
  }
};

/**
 * Get all conversations for current user
 */
export const getConversations = async (): Promise<Conversation[]> => {
  const token = localStorage.getItem('jwt_token');
  
  try {
    const response = await fetch(`${API_URL}/chat/conversations`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    return response.json();
  } catch (error) {
    console.error('Get conversations error:', error);
    return [];
  }
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const token = localStorage.getItem('jwt_token');
  
  try {
    const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    return response.json();
  } catch (error) {
    console.error('Get messages error:', error);
    return [];
  }
};

/**
 * Send a message
 */
export const sendMessage = async (conversationId: string, content: string): Promise<Message> => {
  const token = localStorage.getItem('jwt_token');
  
  const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send message');
  }

  return response.json();
};

/**
 * Create or get conversation with a user
 */
export const createConversation = async (otherUserId: string): Promise<Conversation> => {
  const token = localStorage.getItem('jwt_token');
  
  const response = await fetch(`${API_URL}/chat/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify({ otherUserId })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create conversation');
  }

  return response.json();
};

/**
 * Mark messages as read
 */
export const markAsRead = async (conversationId: string): Promise<void> => {
  const token = localStorage.getItem('jwt_token');
  
  await fetch(`${API_URL}/chat/conversations/${conversationId}/read`, {
    method: 'PUT',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
};