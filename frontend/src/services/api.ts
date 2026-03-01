import { Ticket, User, AppNotification } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'x-auth-token': token } : {}),
  };
};

export const authService = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || data.details || 'Login failed');
    return data;
  },
  register: async (data: any) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.msg || result.details || 'Registration failed');
    return result;
  },
};

export const ticketService = {
  getMyTickets: async (): Promise<Ticket[]> => {
    const res = await fetch(`${API_URL}/tickets/my-tickets`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch tickets');
    return res.json();
  },
  getAllTickets: async (): Promise<Ticket[]> => {
    const res = await fetch(`${API_URL}/tickets/all`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch all tickets');
    return res.json();
  },
  submitTicket: async (data: any) => {
    const isFormData = data instanceof FormData;
    const headers = getHeaders();

    // If sending FormData, do not manually set Content-Type.
    // Fetch will automatically set it to multipart/form-data with the correct boundary.
    if (isFormData) {
      delete headers['Content-Type'];
    }

    const res = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit ticket');
    return res.json();
  },
  updateTicket: async (id: string, data: { status: string; remarks?: string }) => {
    const res = await fetch(`${API_URL}/tickets/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update ticket');
    return res.json();
  },
};

export const analyticsService = {
  getStats: async () => {
    const res = await fetch(`${API_URL}/analytics`, {
      headers: getHeaders(),
    });

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to fetch analytics');
      return data;
    } else {
      const text = await res.text();
      console.error("Unexpected response from server:", text.substring(0, 200));
      throw new Error(`Server error (${res.status}): Expected JSON but received ${contentType || 'unknown content'}`);
    }
  },
};

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_URL}/users`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },
  updateUser: async (id: string, data: { role?: string; department?: string }) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },
};

export const notificationService = {
  getNotifications: async (): Promise<AppNotification[]> => {
    const res = await fetch(`${API_URL}/notifications`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },
  markAllAsRead: async () => {
    const res = await fetch(`${API_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark read');
    return res.json();
  },
};

export const ragService = {
  askQuestion: async (question: string) => {
    // The backend server runs separately on port 5000
    const res = await fetch(`${API_URL}/rag`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question }),
    });

    // Attempt to parse JSON response
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.details || 'Failed to get answer');
      return data;
    } else {
      const text = await res.text();
      console.error("Unexpected RAG response:", text.substring(0, 200));
      throw new Error(`Server error (${res.status}): Expected JSON but received ${contentType || 'unknown content'}`);
    }
  },
};
