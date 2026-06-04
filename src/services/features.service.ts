import api from "./api/apiClient";

// ─── Dashboard Stats ─────────────────────────────────────────────────────

export interface DashboardStats {
  totalTrips: number;
  completedTrips: number;
  ongoingTrips: number;
  spotsVisited: number;
  statesExplored: number;
  daysTraveled: number;
  aiGenerations: number;
  totalNotes: number;
}

export const getDashboardStats = () =>
  api.get<DashboardStats>("/users/me/stats").then(r => r.data);

// ─── Spot Visit ──────────────────────────────────────────────────────────

export interface TripProgress {
  totalSpots: number;
  visitedCount: number;
  percentage: number;
  visitedSpotIds: string[];
}

export const toggleSpotVisit = (spotId: string, tripId?: string, tripDayId?: string) =>
  api.post<{ visited: boolean; message: string }>("/spots/visit", { spotId, tripId, tripDayId }).then(r => r.data);

export const getTripProgress = (tripId: string) =>
  api.get<TripProgress>(`/trips/${tripId}/progress`).then(r => r.data);

// ─── Trip Share ──────────────────────────────────────────────────────────

export interface ShareLink {
  shareUrl: string;
  token: string;
  expiresAt: string;
}

export const createShareLink = (tripId: string) =>
  api.post<ShareLink>(`/trips/${tripId}/share`).then(r => r.data);

export const getSharedTrip = (token: string) =>
  api.get(`/shared/trip/${token}`).then(r => r.data);

// ─── Forgot Password ────────────────────────────────────────────────────

export const forgotPassword = (email: string) =>
  api.post("/auth/forgot-password", { email }).then(r => r.data);

export const resetPassword = (token: string, newPassword: string) =>
  api.post("/auth/reset-password", { token, newPassword }).then(r => r.data);

// ─── Weather ─────────────────────────────────────────────────────────────

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  description: string;
}

export const getWeather = (lat: number, lng: number) =>
  api.get<WeatherData>(`/weather?lat=${lat}&lng=${lng}`).then(r => r.data);

// ─── Checklist ───────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  tripId: string;
  item: string;
  isChecked: boolean;
  category: string;
}

export interface ChecklistResponse {
  items: ChecklistItem[];
  total: number;
  checked: number;
  percentage: number;
}

export const getChecklist = (tripId: string) =>
  api.get<ChecklistResponse>(`/trips/${tripId}/checklist`).then(r => r.data);

export const addChecklistItem = (tripId: string, item: string, category?: string) =>
  api.post<ChecklistItem>(`/trips/${tripId}/checklist`, { item, category }).then(r => r.data);

export const addBulkChecklistItems = (tripId: string, items: string[]) =>
  api.post(`/trips/${tripId}/checklist/bulk`, { items }).then(r => r.data);

export const toggleChecklistItem = (itemId: string) =>
  api.patch<ChecklistItem>(`/checklist/${itemId}/toggle`).then(r => r.data);

export const deleteChecklistItem = (itemId: string) =>
  api.delete(`/checklist/${itemId}`).then(r => r.data);

// ─── Budget ──────────────────────────────────────────────────────────────

export interface BudgetData {
  budget: number;
  spent: { activities: number; entryFees: number; total: number };
  percentage: number;
  perPerson: number;
}

export const getTripBudget = (tripId: string) =>
  api.get<BudgetData>(`/trips/${tripId}/budget`).then(r => r.data);

export const updateTripBudget = (tripId: string, budget: number) =>
  api.patch(`/trips/${tripId}/budget`, { budget }).then(r => r.data);

// ─── Notes / Journal ─────────────────────────────────────────────────────

export interface TripNote {
  id: string;
  tripId: string;
  dayNumber: number | null;
  content: string;
  mood: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getTripNotes = (tripId: string) =>
  api.get<{ notes: TripNote[] }>(`/trips/${tripId}/notes`).then(r => r.data.notes);

export const createTripNote = (tripId: string, data: { content: string; mood?: string; dayNumber?: number }) =>
  api.post<TripNote>(`/trips/${tripId}/notes`, data).then(r => r.data);

export const updateTripNote = (noteId: string, data: { content?: string; mood?: string }) =>
  api.patch<TripNote>(`/notes/${noteId}`, data).then(r => r.data);

export const deleteTripNote = (noteId: string) =>
  api.delete(`/notes/${noteId}`).then(r => r.data);

// ─── Transport ───────────────────────────────────────────────────────────

export interface TransportDetails {
  id?: string;
  tripId: string;
  listingId: string | null;
  rentalType: string | null;
  rentalProvider: string | null;
  rentalDetails: string | null;
  cabProvider: string | null;
  cabDetails: string | null;
  estimatedCost: number;
  isPaid: boolean;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  razorpayOrderId?: string | null;
}

export interface MarketplaceVehicle {
  id: string;
  name: string;
  type: 'CAB' | 'RENTAL_BIKE' | 'RENTAL_CAR';
  imageUrl: string | null;
  description: string | null;
  listings: Array<{
    id: string;
    price: number;
    provider: {
      id: string;
      name: string;
      phone: string;
      rating: number;
      city: string | null;
    };
  }>;
  startingPrice: number | null;
  vendorCount: number;
}

export const getTripTransport = (tripId: string) =>
  api.get<TransportDetails>(`/trips/${tripId}/transport`).then(r => r.data);

export const updateTripTransport = (tripId: string, data: Partial<TransportDetails>) =>
  api.patch<TransportDetails>(`/trips/${tripId}/transport`, data).then(r => r.data);

export interface MarketplaceResponse {
  marketplace: MarketplaceVehicle[];
  pickupPoints: Array<{ id: string; name: string }>;
}

export const getTransportMarketplace = (type?: string, tripId?: string, city?: string) =>
  api.get<MarketplaceResponse>('/transport/marketplace', { params: { type, tripId, city } }).then(r => r.data);

// ─── Transport Payments ──────────────────────────────────────────────────

export const createTransportOrder = (data: { listingId: string; tripId: string; amount: number; details: any }) =>
  api.post('/bookings/transport-order', data).then(r => r.data);

export const verifyTransportPayment = (bookingId: string, data: any) =>
  api.post(`/bookings/${bookingId}/verify-payment`, data).then(r => r.data);

// ─── Explore / Discover ─────────────────────────────────────────────────

export interface ExploreDestination {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  heroImage: string | null;
  state: string;
  spotCount: number;
  avgDays: number;
}

export interface ExploreSpot {
  id: string;
  name: string;
  slug: string;
  type: string;
  imageUrl: string | null;
  aiSummary: string | null;
  priorityScore: number;
  entryFee: number;
  visitDurationMinutes: number;
  destination: { name: string; slug: string };
}

export const exploreDestinations = (params?: { search?: string; stateId?: string; page?: number }) =>
  api.get<{ destinations: ExploreDestination[]; total: number; page: number; totalPages: number }>("/explore/destinations", { params }).then(r => r.data);

export const explorePopularSpots = (limit?: number) =>
  api.get<{ spots: ExploreSpot[] }>("/explore/spots/popular", { params: { limit } }).then(r => r.data);
