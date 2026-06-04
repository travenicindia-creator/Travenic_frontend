import apiClient from './api/apiClient';

export interface Destination {
  id: string;
  name: string;
  description: string;
  image: string | null;  // Changed from imageUrl
  avg_days?: number;     // Added
  spotCount: number;
  state?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface TravelSpot {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  durationMinutes: number;
  bestTimeToVisit: string;
  imageUrl: string | null;
  activityCount: number;
}

export interface DestinationDetail extends Destination {
  spots: TravelSpot[];
}

export interface State {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export const destinationService = {
  getStates: async (): Promise<State[]> => {
    const response = await apiClient.get('/states');
    return response.data.states;
  },

  getDestinations: async (stateId?: string): Promise<Destination[]> => {
    const response = await apiClient.get('/destinations', { params: { stateId } });
    return response.data.destinations;
  },

  getDestinationWithSpots: async (id: string): Promise<DestinationDetail> => {
    const response = await apiClient.get(`/destinations/${id}/spots`);
    return {
      ...response.data.destination,
      spots: response.data.spots
    };
  },

  getSpot: async (id: string): Promise<TravelSpot> => {
    const response = await apiClient.get(`/spots/${id}`);
    return response.data.spot;
  }
};

export default destinationService;
