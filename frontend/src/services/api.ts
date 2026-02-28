import { Ticket, User, Message } from '../types';

const API_URL = '/api';

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
  submitTicket: async (data: { title: string; description: string; category: string }) => {
    const res = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
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
