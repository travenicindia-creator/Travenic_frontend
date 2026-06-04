import apiClient from "./api/apiClient";

export interface Activity {
  id: string;
  title: string;
  description: string;
  pricePerPerson: number;
  isBookable: boolean;
  durationMinutes?: number;
  difficulty?: string;
  imageUrl?: string;
  travelSpot?: {
    id: string;
    name: string;
    slug: string;
  };
}

export const activityService = {
  getActivities: async (spotId?: string): Promise<Activity[]> => {
    const response = await apiClient.get("/activities", {
      params: { spotId }
    });
    return response.data.activities;
  },

  getSpotActivities: async (spotId: string): Promise<Activity[]> => {
    const response = await apiClient.get(`/spots/${spotId}`);
    return response.data.spot.activities;
  },

  getActivityById: async (id: string): Promise<Activity> => {
    const response = await apiClient.get(`/activities/${id}`);
    return response.data.activity;
  }
};

export default activityService;

