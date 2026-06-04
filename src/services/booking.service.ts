import apiClient from "./api/apiClient";

export interface Booking {
  id: string;
  bookingRef?: string;
  type: 'ACTIVITY' | 'TRANSPORT';
  tripId?: string;
  activityId?: string;
  transportId?: string;
  userId: string;
  numberOfPersons: number;
  totalAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'PAID' | 'CONFIRMED' | 'CANCELLED' | 'REFUND_PROCESSING' | 'REFUNDED' | 'REFUND_FAILED' | 'REJECTED' | 'COMPLETED' | 'EXPIRED';
  scheduledDate?: string;
  refundAmount?: number;
  refundId?: string;
  cancellationPolicy?: { window: string, refund: string, highlight?: boolean }[];
  createdAt: string;
  activity?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  trip?: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    destination?: {
      id: string;
      name: string;
    };
  };
  tripTransport?: {
    rentalType?: string;
    listing?: {
      vehicleModel?: { name: string, type: string };
    };
  };
  payment?: {
    status: string;
    razorpayPaymentId?: string;
  };
}

export const bookingService = {
  getUserBookings: async (filters?: { status?: string, type?: string }) => {
    const response = await apiClient.get("/bookings", { params: filters });
    return response.data;
  },

  getBooking: async (id: string) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  getRefundPreview: async (id: string) => {
    const response = await apiClient.get(`/bookings/${id}/refund-preview`);
    return response.data;
  },

  downloadBookingPDF: async (id: string, reference: string) => {
    const response = await apiClient.get(`/bookings/${id}/pdf`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `booking-${reference}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  cancelBooking: async (id: string, reason?: string) => {
    const response = await apiClient.post(`/bookings/${id}/cancel`, { reason });
    return response.data;
  }
};
