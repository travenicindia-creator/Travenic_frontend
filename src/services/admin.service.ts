import api from './api/apiClient';

export interface AdminBooking {
  id: string;
  bookingRef: string;
  numberOfPersons: number;
  totalAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'PAID' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  trip?: {
    id: string;
    title: string;
  };
  activity?: {
    id: string;
    title: string;
  };
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'TRAVELER' | 'ADMIN';
  plan: 'FREE' | 'PRO';
  createdAt: string;
  isVerified: boolean;
}

class AdminService {
  async getBookings(): Promise<AdminBooking[]> {
    const response = await api.get('/admin/bookings');
    return response.data.bookings;
  }

  async confirmBooking(id: string): Promise<AdminBooking> {
    const response = await api.patch(`/admin/bookings/${id}/confirm`);
    return response.data.booking;
  }

  async rejectBooking(id: string, note?: string): Promise<AdminBooking> {
    const response = await api.post(`/admin/bookings/${id}/reject`, { note });
    return response.data.booking;
  }

  async getUsers(): Promise<AdminUser[]> {
    const response = await api.get('/admin/users');
    return response.data.users;
  }

  async createTravelSpot(data: any) {
    const response = await api.post('/admin/travel-spots', data);
    return response.data.spot;
  }

  async createActivity(data: any) {
    const response = await api.post('/admin/activities', data);
    return response.data.activity;
  }
}

export const adminService = new AdminService();
