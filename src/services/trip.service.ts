import apiClient from "./api/apiClient";

export interface CreateTripData {
  title?: string;
  state_id?: string;
  destination_id?: string;
  destination_ids?: string[]; 
  start_date: string;    
  end_date: string;      
  traveler_count: number; 
  type?: string | string[];         
  style?: string;
  start_details?: {
    mode: 'flight' | 'train' | 'bus' | 'car';
    from_location: string;
    to_location: string;
    arrival_time: string;
  };
  end_details?: {
    mode: 'flight' | 'train' | 'bus' | 'car';
    from_location: string;
    to_location: string;
    departure_time: string;
  };
}

export interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  travelerCount: number;
  status: string;
  state?: {
    id: string;
    name: string;
  };
  destination: {
    id: string;
    name: string;
    heroImage?: string;
  };
  destinations?: Array<{
    destinationId: string;
    destination: {
      id: string;
      name: string;
      description?: string;
      heroImage?: string;
      travelSpots?: Array<{
        id: string;
        name: string;
        latitude: number;
        longitude: number;
        imageUrl?: string;
      }>;
    };
    orderIndex: number;
  }>;
  tripDays?: Array<{
    id: string;
    dayNumber: number;
    date: string;
    itineraryItems?: Array<{
      id: string;
      orderIndex: number;
      startTime?: string;
      endTime?: string;
      travelSpot?: {
        id: string;
        name: string;
        latitude?: number;
        longitude?: number;
        imageUrl?: string;
        type?: string;
      };
      activity?: any;
    }>;
  }>;
  itineraryDays?: Array<{
    id: string;
    dayNumber: number;
    date: string;
    destination?: {
      id: string;
      name: string;
    }
  }>;
  startDetails?: {
    id: string;
    mode: 'flight' | 'train' | 'bus' | 'car';
    fromLocation: string;
    toLocation: string;
    arrivalTime: string;
    notes?: string | null;
  };
  endDetails?: {
    id: string;
    mode: 'flight' | 'train' | 'bus' | 'car';
    fromLocation: string;
    toLocation: string;
    departureTime: string;
    notes?: string | null;
  };
  totalDays?: number;
  members?: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
  }>;
}

export const tripService = {
  createTrip: async (data: CreateTripData) => {
    const response = await apiClient.post("/trips", data);
    return response.data;
  },

  getTrips: async () => {
    const response = await apiClient.get("/trips");
    return response.data;
  },

  getTrip: (id: string) =>
    apiClient.get(`/trips/${id}`).then(res => res.data.trip),

  updateTripStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/trips/${id}/status`, { status });
    return response.data;
  },

  getActiveTrip: () =>
    apiClient.get('/trips/active').then(res => res.data),

  getDayGuide: (tripDayId: string) =>
    apiClient.get(`/day-guide/${tripDayId}`).then(res => res.data as DayGuide),

  getDayTimeline: (tripId: string, dayId: string) =>
    apiClient.get(`/trips/${tripId}/days/${dayId}`).then(res => res.data as ItineraryDayTimeline),

  getWeather: (lat: number, lng: number) =>
    apiClient.get(`/weather?lat=${lat}&lng=${lng}`).then(res => res.data),

  getNearbySpotsByCoords: (lat: number, lng: number, radius: number = 10, tripId?: string) =>
    apiClient.get(`/spots/nearby-coords`, {
      params: { lat, lng, radius, tripId }
    }).then(res => res.data),

  addSpotToSlot: (slot_id: string | null, spot_id: string, tripDayId?: string, slot_type?: string, startTime?: string, endTime?: string) =>
    apiClient.post(`/itinerary/add-spot-block`, { slot_id, spot_id, day_id: tripDayId, slot_type, startTime, endTime }).then(res => res.data),

  getActivities: (spotId: string) =>
    apiClient.get(`/activities`, { params: { spotId } }).then(res => res.data),

  reorderBlocks: (blockId: string, newPosition: number, target_slot_id?: string) =>
    apiClient.post(`/itinerary/reorder-blocks`, { block_id: blockId, new_position: newPosition, target_slot_id }).then(res => res.data),

  removeBlock: (blockId: string) =>
    apiClient.delete(`/itinerary/block/${blockId}`).then(res => res.data),

  addActivityToSlot: (slot_id: string, activity_id: string) =>
    apiClient.post(`/itinerary/add-activity`, { slotId: slot_id, activityId: activity_id }).then(res => res.data),

  recalculateDayRoutes: (dayId: string) =>
    apiClient.post(`/itinerary/recalculate-route/${dayId}`).then(res => res.data),

  upsertTripStartDetails: async (tripId: string, data: any) => {
    const response = await apiClient.put(`/trips/${tripId}/start-details`, { start_details: data });
    return response.data;
  },

  upsertTripEndDetails: async (tripId: string, data: any) => {
    const response = await apiClient.put(`/trips/${tripId}/end-details`, { end_details: data });
    return response.data;
  },

  updateReturnDetails: async (tripId: string, data: any) => {
    const response = await apiClient.put(`/trips/${tripId}/end-details`, { end_details: data });
    return response.data.endDetails;
  },

  generateInviteLink: async (tripId: string, role: 'EDITOR' | 'VIEWER' = 'EDITOR') => {
    const response = await apiClient.post(`/trips/${tripId}/invite`, { role });
    return response.data; // { inviteUrl, token }
  },

  acceptInvite: async (token: string) => {
    const response = await apiClient.post(`/trips/invite/${token}/accept`);
    return response.data; // { message, tripId }
  },

  getGuideAdvice: (spotId: string) =>
    apiClient.get(`/itinerary/guide-advice`, { params: { spotId } }).then(res => res.data as { advice: string, packingTip: string }),

  rescheduleFromNow: (dayId: string, startTime?: string) =>
    apiClient.post(`/itinerary/reschedule-from-now`, { dayId, startTime }).then(res => res.data),

  getExpenses: (tripId: string) =>
    apiClient.get(`/trips/${tripId}/expenses`).then(res => res.data),

  createExpense: (tripId: string, data: any) =>
    apiClient.post(`/trips/${tripId}/expenses`, data).then(res => res.data),

  scanReceipt: (text: string) =>
    apiClient.post(`/expenses/scan`, { receiptText: text }).then(res => res.data as { merchant: string, amount: number, currency: string, category: string, title: string }),

  verifyPayment: async (tripId: string, paymentDetails: any) => {
    const response = await apiClient.post('/bookings/verify-payment', { tripId, ...paymentDetails });
    return response.data;
  }
};

export interface ItineraryDayTimeline {
  id: string;
  day_number: number;
  date: string;
  combined_polyline: string[];
  slots: ItinerarySlot[];
}

export interface ItinerarySlot {
  id: string;
  slot_type: 'MORNING' | 'AFTERNOON' | 'EVENING';
  start_time: string;
  end_time: string;
  blocks: ItineraryBlock[];
  spots: ItinerarySpot[];
  isActive?: boolean;
}

export interface ItineraryBlock {
  id: string;
  block_type: 'SPOT' | 'TRAVEL' | 'ACTIVITY' | 'FOOD' | 'FREE_TIME';
  spot_id?: string;
  name: string;
  image?: string;
  visit_duration: number;
  startTime: string;
  endTime: string;
  description?: string;
  orderIndex: number;
  latitude: number;
  longitude: number;
  slug?: string;
  // Travel specific
  distance_km?: number;
  travel_time_minutes?: number;
  geometry?: string;
}

export interface ItinerarySpot {
  spot_id: string;
  name: string;
  image: string;
  visit_duration: number;
  travel_time_from_previous: number | null;
  latitude: number;
  longitude: number;
  geometry: string | null;
}

export interface DayGuide {
  day: number;
  date: string;
  location: string;
  description: string;
  spots: DaySpot[];
}

export interface DaySpot {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  time: string;
  endTime: string;
  description: string;
  image: string;
  bestVisitTime: string;
  entryFees: string;
  distanceFromPrev: string | null;
  transportMode: string;
  proTip: string;
  activities: Array<{
    id: string;
    title: string;
    price: number;
    description?: string;
    isBookable: boolean;
  }>;
}
