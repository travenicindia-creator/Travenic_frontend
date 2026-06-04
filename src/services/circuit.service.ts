import apiClient from "./api/apiClient";

export interface CircuitStop {
  id: string;
  circuitId: string;
  stopOrder: number;
  destinationId: string;
  averageStayTime: string;
  travelTimeToNextStop: number;
  transportOptions: string[];
  weatherSensitivity: string | null;
  recommendedActivities: string[];
  destination: {
    id: string;
    name: string;
    slug: string;
    heroImage: string | null;
    description: string | null;
    type: string | null;
    avgDays: number | null;
  };
}

export interface SeasonalInfo {
  id: string;
  circuitId: string;
  season: string;
  status: string;
  warningNote: string | null;
  tips: string[];
}

export interface Circuit {
  id: string;
  circuitName: string;
  slug: string;
  description: string | null;
  destinationState: string;
  tags: string[];
  difficultyLevel: string;
  estimatedBudget: number | null;
  recommendedDuration: number;
  bestSeason: string | null;
  backpackerScore: number;
  coverImage: string | null;
  status: string;
  isFeatured: boolean;
  isTrending: boolean;
  region: string | null;
  stops?: CircuitStop[];
  seasonalInfos?: SeasonalInfo[];
}

export const circuitService = {
  getCircuits: async (params?: { destinationId?: string; state?: string }): Promise<Circuit[]> => {
    const response = await apiClient.get('/circuits', { params });
    return response.data.data || [];
  },

  getCircuitById: async (id: string): Promise<Circuit> => {
    const response = await apiClient.get(`/circuits/${id}`);
    return response.data.data;
  }
};

export default circuitService;
