import apiClient from "./api/apiClient";

export interface SpotDetail {
  id: string;
  spot_name: string;
  hero_image: string;
  description: string;
  latitude: number;
  longitude: number;
  visit_duration_minutes: number;
  best_time: string;
  opening_time: string;
  closing_time: string;
  entry_fee: number;
  difficulty_level: string;
  travel_tips: string;
  ai_summary: string;
  nearby_spots: Array<{
    id: string;
    name: string;
    slug: string;
    image: string;
  }>;
  activities: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    duration: number;
    isBookable: boolean;
  }>;
}

export const spotService = {
  getSpotBySlug: (slug: string) =>
    apiClient.get(`/spots/detail/${slug}`).then(res => res.data as SpotDetail),
  getSpotById: (id: string) =>
    apiClient.get(`/spots/${id}`).then(res => res.data as SpotDetail),
};
