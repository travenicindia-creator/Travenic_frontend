import api from "./api/apiClient";

// ─── Types ───────────────────────────────────────────────────────────────

export interface AISlot {
  id: string | null;
  name: string;
  tip?: string | null;
  alternative?: string | null;
  reasonIncluded?: string | null;
  importanceScore?: number | null;
  travelTimeToNext?: string | null;
  tipDetail?: {
    text: string;
    confidence: "High" | "Medium" | "Low";
    sourceType: "local_insight" | "community_report" | "seasonal_pattern";
  } | null;
}

export interface AIDay {
  day: number;
  theme?: string;
  reasoning?: string;
  destination?: string;
  travelNote?: string | null;
  slots: {
    morning: AISlot[];
    afternoon: AISlot[];
    evening: AISlot[];
  };
}

export interface HostelHub {
  name: string;
  type: "hostel" | "hub";
  estimatedPrice: string;
  socialRating: number;
  vibe: string;
  description: string;
}

export interface AIExtras {
  dayAllocation?: Record<string, number> | null;
  destinationAllocation?: Record<string, { allocatedDays: number; allocationReason: string }> | null;
  packingTips?: string[] | null;
  smartPacking?: {
    essentialItems: string[];
    recommendedItems: string[];
    optionalItems: string[];
  } | null;
  localExperiences?: Record<string, {
    bestLocalFood: string;
    localEtiquette: string;
    hiddenGem: string;
  }> | null;
  hostels?: Record<string, HostelHub[]> | null;
  bestTimeToVisit?: string | null;
  budgetEstimate?: {
    perPersonPerDay: number;
    currency: string;
    breakdown: string;
  } | null;
}

export interface AIMeta {
  model?: string;
  latencyMs?: number;
  cached?: boolean;
}

export interface AIGenerationResponse {
  message: string;
  itinerary: AIDay[];
  meta?: AIMeta;
  extras?: AIExtras;
}

export interface AIGenerationParams {
  circuitId?: string;
  destinationId?: string;
  destinationIds?: string[];
  tripLength: number;
  travelStyle: string;
  travelType: string | string[];
  startDate?: string;
  travelerCount?: number;
}

// ─── SSE Stream Types ────────────────────────────────────────────────────

export interface StreamCallbacks {
  onChunk?: (delta: string) => void;
  onComplete?: (response: AIGenerationResponse) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onStage?: (stage: { currentStage: string; percentage: number }) => void;
  onDayReady?: (day: AIDay) => void;
}

// ─── Service ─────────────────────────────────────────────────────────────

class AIService {
  // Standard generation (POST)
  async generateItinerary(params: AIGenerationParams): Promise<AIGenerationResponse> {
    const response = await api.post<AIGenerationResponse>("/ai/generate-itinerary", params);
    return response.data;
  }

  // Streaming generation (SSE - Tier 4)
  streamItinerary(params: AIGenerationParams, callbacks: StreamCallbacks): () => void {
    const queryParams = new URLSearchParams();

    if (params.circuitId) {
      queryParams.set("circuitId", params.circuitId);
    } else if (params.destinationIds && params.destinationIds.length > 0) {
      queryParams.set("destinationIds", params.destinationIds.join(","));
    } else if (params.destinationId) {
      queryParams.set("destinationId", params.destinationId);
    }

    queryParams.set("tripLength", String(params.tripLength));
    queryParams.set("travelStyle", params.travelStyle);
    
    if (Array.isArray(params.travelType)) {
      queryParams.set("travelType", params.travelType.join(","));
    } else {
      queryParams.set("travelType", params.travelType);
    }

    if (params.startDate) queryParams.set("startDate", params.startDate);
    if (params.travelerCount) queryParams.set("travelerCount", String(params.travelerCount));

    // Get token from cookie or localStorage
    const token = document.cookie.match(/token=([^;]+)/)?.[1] 
      || localStorage.getItem("token") || "";

    const baseUrl = api.defaults.baseURL || "";
    const url = `${baseUrl}/ai/stream-itinerary?${queryParams.toString()}&token=${encodeURIComponent(token)}`;

    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.addEventListener("start", () => {
      callbacks.onStart?.();
    });

    eventSource.addEventListener("stage", (event) => {
      try {
        const data = JSON.parse(event.data);
        callbacks.onStage?.(data);
      } catch {
        // Skip
      }
    });

    eventSource.addEventListener("day_ready", (event) => {
      try {
        const data = JSON.parse(event.data);
        callbacks.onDayReady?.(data);
      } catch {
        // Skip
      }
    });

    // Dynamic dynamic listeners based on tripLength
    for (let i = 1; i <= params.tripLength; i++) {
      eventSource.addEventListener(`DAY_${i}_READY`, (event) => {
        try {
          const data = JSON.parse(event.data);
          callbacks.onDayReady?.(data);
        } catch {
          // Skip
        }
      });
      eventSource.addEventListener(`day_${i}_ready`, (event) => {
        try {
          const data = JSON.parse(event.data);
          callbacks.onDayReady?.(data);
        } catch {
          // Skip
        }
      });
    }

    eventSource.addEventListener("chunk", (event) => {
      try {
        const data = JSON.parse(event.data);
        callbacks.onChunk?.(data.delta);
      } catch {
        // Skip malformed chunks
      }
    });

    eventSource.addEventListener("complete", (event) => {
      try {
        const data = JSON.parse(event.data);
        callbacks.onComplete?.({
          message: "Smart itinerary generated.",
          itinerary: data.itinerary,
          meta: data.meta,
          extras: data.extras,
        });
      } catch (err) {
        callbacks.onError?.("Failed to parse completion data");
      }
      eventSource.close();
    });

    eventSource.addEventListener("error", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data);
        callbacks.onError?.(data.error || "Stream error");
      } catch {
        callbacks.onError?.("An error occurred while streaming the itinerary.");
      }
      eventSource.close();
    });

    eventSource.onerror = () => {
      callbacks.onError?.("AI service connection failed. Please try again.");
      eventSource.close();
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }

  // Save itinerary
  async saveItinerary(tripId: string, itinerary: AIDay[]): Promise<any> {
    const response = await api.post("/ai/save-itinerary", { tripId, itinerary });
    return response.data;
  }

  // Ask doubt about a spot or activity
  async askDoubt(itemId: string, itemType: "spot" | "activity", message: string, history?: Array<{ sender: "user" | "ai"; text: string }>): Promise<{ answer: string }> {
    const response = await api.post<{ answer: string }>("/ai/ask-doubt", { itemId, itemType, message, history });
    return response.data;
  }
}

export const aiService = new AIService();
