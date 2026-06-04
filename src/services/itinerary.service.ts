import apiClient from "./api/apiClient";

export interface ItineraryItem {
  id: string;
  tripDayId: string;
  travelSpotId?: string | null;
  activityId?: string | null;
  startTime: string;
  endTime: string;
  orderIndex: number;
  notes?: string;
  travelSpot?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

export interface TripDayItinerary {
  id: string;
  dayNumber: number;
  date: string;
  itineraryItems: ItineraryItem[];
}

export interface AddSpotData {
  tripDayId: string;
  travelSpotId?: string | null;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface ReorderItem {
  id: string;
  orderIndex: number;
}

export const itineraryService = {
  getTripItinerary: async (tripId: string): Promise<TripDayItinerary[]> => {
    const response = await apiClient.get(`/trips/${tripId}/itinerary`);
    return response.data.tripDays;
  },

  addSpot: async (data: AddSpotData): Promise<ItineraryItem> => {
    const response = await apiClient.post("/itinerary/add-spot", data);
    return response.data;
  },

  removeSpot: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/itinerary/remove-spot/${itemId}`);
  },

  reorderSpots: async (tripDayId: string, items: ReorderItem[]): Promise<void> => {
    await apiClient.patch("/itinerary/reorder", { tripDayId, items });
  },

  getTodayTimeline: async (tripId?: string): Promise<any> => {
    const url = tripId ? `/trips/${tripId}/today` : '/trips/active/today';
    const response = await apiClient.get(url);
    return response.data;
  },

  getDayGuide: async (tripDayId: string): Promise<any> => {
    const response = await apiClient.get(`/day-guide/${tripDayId}`);
    return response.data;
  }
};
