import apiClient from "./api/apiClient";

export interface CartItem {
  id: string;
  userId: string;
  tripId?: string;
  type: 'ACTIVITY' | 'TRANSPORT';
  activityId?: string;
  transportListingId?: string;
  numberOfPersons: number;
  scheduledDate?: string;
  transportDetails?: any;
  price: number;
  createdAt: string;
  activity?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  transportListing?: {
    provider?: { name: string; phone: string; rating: number };
    vehicleModel?: { name: string; type: string };
  };
  trip?: {
    id: string;
    title: string;
  };
}

export const cartService = {
  getCart: async (tripId?: string): Promise<{ items: CartItem[] }> => {
    const response = await apiClient.get('/cart', { params: { tripId } });
    return response.data;
  },

  addToCart: async (data: {
    tripId?: string;
    type: 'ACTIVITY' | 'TRANSPORT';
    activityId?: string;
    transportListingId?: string;
    numberOfPersons?: number;
    scheduledDate?: string;
    transportDetails?: any;
    price: number;
  }) => {
    const response = await apiClient.post('/cart', data);
    return response.data;
  },

  removeFromCart: async (id: string) => {
    const response = await apiClient.delete(`/cart/${id}`);
    return response.data;
  },

  updateCartItem: async (id: string, data: { numberOfPersons: number }) => {
    const response = await apiClient.patch(`/cart/${id}`, data);
    return response.data;
  },

  checkout: async (tripId: string) => {
    const response = await apiClient.post('/cart/checkout', { tripId });
    return response.data;
  },

  verifyPayment: async (tripId: string, paymentDetails: any) => {
    const response = await apiClient.post('/bookings/verify-payment', { tripId, ...paymentDetails });
    return response.data;
  }
};
