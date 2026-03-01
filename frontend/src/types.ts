export interface Ticket {
  _id: string;
  student: string | { _id: string; name: string; email: string };
  title: string;
  description: string;
  category: 'Dormitory' | 'Lab Equipment' | 'Internet' | 'Classroom' | 'Other';
  status: 'Open' | 'In Progress' | 'Resolved';
  remarks?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface User {
  id: string;
  name: string;
  role: 'Student' | 'Staff' | 'Admin';
  email?: string;
  department?: string;
}

export interface AppNotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}
