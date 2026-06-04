"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Section } from "@/components/ui/section";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { tripService } from "@/services/trip.service";
import destinationService, { Destination, State } from "@/services/destinationService";
import { useAuthStore } from "@/store/use-auth-store";
import { 
  ArrowLeft, 
  ArrowRight, 
  Plane, 
  Loader2, 
  Users, 
  Calendar, 
  Map as MapIcon, 
  Compass, 
  Check,
  Sparkles,
  Trash2,
  Edit2,
  Zap,
  TrainFront,
  Bus,
  Car,
  Utensils,
  BookOpen,
  Gem,
  Briefcase,
  ShieldAlert,
  CheckCircle2,
  Info,
  Home,
  Coffee,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { aiService, AIDay, AIExtras, AIMeta } from "@/services/ai.service";
import { toast } from "sonner";
import PremiumUpgradeModal from "@/components/modals/PremiumUpgradeModal";
import { circuitService, Circuit } from "@/services/circuit.service";
import MapRoute, { MapLocation } from "@/components/ui/MapRoute";
import { MapPin as MapPinIcon } from "lucide-react";

const TRAVEL_TYPES = [
  { label: "Adventure", value: "Adventure", icon: Compass, color: "text-orange-500", bg: "bg-orange-50" },
  { label: "Leisure", value: "Leisure", icon: Plane, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Culture", value: "Culture", icon: MapIcon, color: "text-purple-500", bg: "bg-purple-50" },
  { label: "Nature", value: "Nature", icon: MapIcon, color: "text-emerald-500", bg: "bg-emerald-50" },
] as const;

const TRAVEL_STYLES = [
  { label: "Relaxed", value: "Relaxed", desc: "Plenty of downtime" },
  { label: "Balanced", value: "Balanced", desc: "Mix of activities" },
  { label: "Packed", value: "Packed", desc: "See it all" },
] as const;

export default function CreateTripPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destLoading, setDestLoading] = useState(true);

  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [circuitsLoading, setCircuitsLoading] = useState(false);
  const [selectedCircuitId, setSelectedCircuitId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    state_id: "",
    destination_id: "",
    destination_ids: [] as string[],
    start_date: "",
    end_date: "",
    traveler_count: 1,
    type: ["Adventure"] as string[],
    style: "Balanced",
    start_details: {
      mode: 'car' as 'flight' | 'train' | 'bus' | 'car',
      from_location: "",
      to_location: "",
      arrival_time: "",
      notes: ""
    },
    skip_start_details: true,
    end_details: {
      mode: 'car' as 'flight' | 'train' | 'bus' | 'car',
      from_location: "",
      to_location: "",
      departure_time: "",
      notes: ""
    },
    skip_end_details: true
  });

  const [states, setStates] = useState<State[]>([]);
  const [exploreWholeState, setExploreWholeState] = useState(false);
  const [statesLoading, setStatesLoading] = useState(true);

  const [aiItinerary, setAiItinerary] = useState<AIDay[] | null>(null);
  const [aiExtras, setAiExtras] = useState<AIExtras | null>(null);
  const [aiMeta, setAiMeta] = useState<AIMeta | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [streamCleanup, setStreamCleanup] = useState<(() => void) | null>(null);
  const [currentStage, setCurrentStage] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [progressiveDays, setProgressiveDays] = useState<AIDay[]>([]);
  const [isFailed, setIsFailed] = useState(false);

  // Dynamic Route Map Coordinate Extractor
  const mapLocations: MapLocation[] = (aiItinerary || progressiveDays).flatMap(day => {
    if (!day || !day.slots) return [];
    return Object.values(day.slots).flatMap((spotsList: any) => 
      (Array.isArray(spotsList) ? spotsList : [spotsList])
        .filter((spotItem: any) => spotItem && spotItem.latitude !== undefined && spotItem.longitude !== undefined && spotItem.latitude !== null && spotItem.longitude !== null)
        .map((spotItem: any) => ({
          id: spotItem.id || spotItem.name,
          name: spotItem.name,
          lat: Number(spotItem.latitude),
          lng: Number(spotItem.longitude)
        }))
    );
  });

  // De-duplicate markers by ID/name
  const uniqueMapLocations: MapLocation[] = Array.from(new globalThis.Map(mapLocations.map(loc => [loc.id, loc])).values());

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24)) + 1;
    return days > 0 ? days : 0;
  };

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const data = await destinationService.getStates();
        setStates(data);
      } catch (err) {
        console.error("Failed to load states", err);
      } finally {
        setStatesLoading(false);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    const fetchDestinations = async () => {
      if (!formData.state_id) {
          setDestinations([]);
          return;
      }
      setDestLoading(true);
      try {
        const data = await destinationService.getDestinations(formData.state_id);
        setDestinations(data);
        if (exploreWholeState) {
          setFormData(prev => ({ ...prev, destination_ids: data.map(d => d.id) }));
        }
      } catch (err) {
        console.error("Failed to load destinations", err);
      } finally {
        setDestLoading(false);
      }
    };
    fetchDestinations();
  }, [formData.state_id, exploreWholeState]);

  useEffect(() => {
    const fetchCircuits = async () => {
      if (!formData.state_id) {
        setCircuits([]);
        setSelectedCircuitId(null);
        return;
      }
      setCircuitsLoading(true);
      try {
        const selectedState = states.find(s => s.id === formData.state_id);
        if (selectedState) {
          const data = await circuitService.getCircuits({ state: selectedState.name });
          setCircuits(data);
        }
      } catch (err) {
        console.error("Failed to load circuits", err);
      } finally {
        setCircuitsLoading(false);
      }
    };
    fetchCircuits();
  }, [formData.state_id, states]);

  const handleSelectCircuit = (circuit: Circuit) => {
    setSelectedCircuitId(circuit.id);
    
    // Bind stops to destination_ids
    if (circuit.stops) {
      const stopDestIds = circuit.stops.map(stop => stop.destinationId);
      setFormData(prev => ({
        ...prev,
        destination_ids: stopDestIds,
      }));
    }
    
    // Set recommended duration
    const duration = circuit.recommendedDuration || 3;
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.getTime() + (duration - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setFormData(prev => {
      // Sync tags if circuit has tags
      let newTypes = prev.type;
      if (circuit.tags && circuit.tags.length > 0) {
        const matched = circuit.tags.map(t => {
          const found = TRAVEL_TYPES.find(tt => tt.label.toLowerCase() === t.toLowerCase() || tt.value.toLowerCase() === t.toLowerCase());
          return found ? found.value : null;
        }).filter(Boolean) as string[];
        if (matched.length > 0) {
          newTypes = matched;
        }
      }
      
      return {
        ...prev,
        start_date: startDate,
        end_date: endDate,
        type: newTypes,
      };
    });

    toast.success(`Selected "${circuit.circuitName}" circuit! Pre-populated dates (${duration} Days) and tags.`);
  };

  const getSeasonalAdvisory = (circuit: Circuit) => {
    if (!formData.start_date || !circuit.seasonalInfos || circuit.seasonalInfos.length === 0) return null;
    const date = new Date(formData.start_date);
    const month = date.getMonth(); // 0-11
    
    // Map months to seasons:
    // Dec-Feb: winter
    // Mar-May: summer
    // Jun-Sep: monsoon
    // Oct-Nov: autumn
    let currentSeason = 'summer';
    if (month === 11 || month <= 1) currentSeason = 'winter';
    else if (month >= 5 && month <= 8) currentSeason = 'monsoon';
    else if (month >= 9 && month <= 10) currentSeason = 'autumn';
    
    const info = circuit.seasonalInfos.find(si => si.season.toLowerCase() === currentSeason.toLowerCase());
    return info || null;
  };

  // Sync "To" location with first destination
  useEffect(() => {
    if (formData.destination_ids.length > 0) {
      const firstDestId = formData.destination_ids[0];
      const dest = destinations.find(d => d.id === firstDestId);
      if (dest && !formData.start_details.to_location) {
        setFormData(prev => ({
          ...prev,
          start_details: {
            ...prev.start_details,
            to_location: dest.name
          }
        }));
      }
    } else if (formData.destination_id) {
       const dest = destinations.find(d => d.id === formData.destination_id);
       if (dest && !formData.start_details.to_location) {
        setFormData(prev => ({
          ...prev,
          start_details: {
            ...prev.start_details,
            to_location: dest.name
          }
        }));
      }
    }
  }, [formData.destination_ids, formData.destination_id, destinations]);

  // Sync Return "From" location with last destination
  useEffect(() => {
    if (formData.destination_ids.length > 0) {
      const lastDestId = formData.destination_ids[formData.destination_ids.length - 1];
      const dest = destinations.find(d => d.id === lastDestId);
      if (dest && !formData.end_details.from_location) {
        setFormData(prev => ({
          ...prev,
          end_details: {
            ...prev.end_details,
            from_location: dest.name
          }
        }));
      }
    }
  }, [formData.destination_ids, destinations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.destination_ids.length === 0 && !formData.destination_id) {
      setError("Please select at least one destination.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = { ...formData };
      if (formData.skip_start_details) {
        delete (payload as any).start_details;
      }
      if (formData.skip_end_details) {
        delete (payload as any).end_details;
      }
      delete (payload as any).skip_start_details;
      delete (payload as any).skip_end_details;

      const result = await tripService.createTrip(payload as any);
      
      // If AI itinerary exists, save it too
      if (aiItinerary && result.trip.id) {
          try {
              await aiService.saveItinerary(result.trip.id, aiItinerary);
              toast.success("Trip created with AI generated itinerary!");
          } catch (saveErr) {
              console.error("Failed to save AI itinerary:", saveErr);
              toast.error("Trip created, but failed to save AI itinerary.");
          }
      } else {
          toast.success("Trip created successfully!");
      }

      router.push(`/dashboard/trips/${result.trip.id}`);
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.limitReached) {
        setIsUpgradeModalOpen(true);
        setError(null);
      } else {
        setError(err.response?.data?.error || err.message || "Something went wrong while creating your trip.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    // Check if itinerary limit or AI limit is reached
    const isItineraryLimitReached = user?.plan === 'FREE' && (user.activeTripCount >= (1 + (user.extraItinerarySlots || 0)));
    const isAILimitReached = user?.plan === 'FREE' && user.aiGenerationsCount >= 3;
    
    if (isItineraryLimitReached || isAILimitReached) {
        setIsUpgradeModalOpen(true);
        return;
    }

    if (formData.destination_ids.length === 0 && !formData.destination_id) {
        toast.error("Please select a destination first.");
        return;
    }
    const days = calculateDays(formData.start_date, formData.end_date);
    if (days <= 0) {
        toast.error("Please select valid dates.");
        return;
    }

    setIsGenerating(true);
    setAiItinerary(null);
    setAiExtras(null);
    setAiMeta(null);
    setStreamText("");
    setCurrentStage("Analyzing Destination");
    setPercentage(5);
    setProgressiveDays([]);
    setIsFailed(false);

    const isMultiDest = formData.destination_ids.length > 1;

    try {
        const params = {
          ...(selectedCircuitId
            ? { circuitId: selectedCircuitId }
            : isMultiDest 
              ? { destinationIds: formData.destination_ids }
              : { destinationId: formData.destination_ids[0] || formData.destination_id }),
          tripLength: days,
          travelStyle: formData.style,
          travelType: formData.type,
          startDate: formData.start_date,
          travelerCount: formData.traveler_count,
        };

        // Use streaming for real-time feedback
        const cleanup = aiService.streamItinerary(params, {
          onStart: () => {
            toast.info("🧠 Travenic AI is starting your itinerary quest...");
            setCurrentStage("Analyzing Destination");
            setPercentage(10);
            setIsFailed(false);
          },
          onStage: (stage) => {
            setCurrentStage(stage.currentStage);
            setPercentage(stage.percentage);
          },
          onDayReady: (day) => {
            setProgressiveDays(prev => {
              if (prev.some(d => d.day === day.day)) {
                return prev.map(d => d.day === day.day ? day : d);
              }
              return [...prev, day].sort((a, b) => a.day - b.day);
            });
            toast.success(`📅 Day ${day.day} generated!`);
          },
          onChunk: (delta) => {
            setStreamText(prev => prev + delta);
          },
          onComplete: (response) => {
            setAiItinerary(response.itinerary);
            setAiExtras(response.extras || null);
            setAiMeta(response.meta || null);
            setStreamText("");
            setIsGenerating(false);
            setCurrentStage("Finalizing Plan");
            setPercentage(100);
            setIsFailed(false);
            toast.success(response.meta?.cached ? "⚡ Cached itinerary loaded!" : "✨ Smart itinerary generated!");
          },
          onError: (error) => {
            setIsGenerating(false);
            setStreamText("");
            setIsFailed(true);
            toast.error(error || "Failed to generate itinerary. You can resume.");
          },
        });

        setStreamCleanup(() => cleanup);
    } catch (err: any) {
        setIsGenerating(false);
        toast.error(err.message || "Failed to generate itinerary.");
    }
  };

  return (
    <Section spacing="md">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black tracking-tight font-heading">Plan Your Journey</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Tell us about your next adventure, and we'll help you organize the perfect trip.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8">
            {/* Basic Info */}
            <Card className="border-none shadow-sm ring-1 ring-border/50 overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Plane className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
                <CardDescription>Give your epic adventure a name.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-8 p-6">
                <div className="grid gap-2">
                  <label htmlFor="trip-title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                    Trip Name
                  </label>
                  <Input
                    id="trip-title"
                    placeholder="e.g. Summer in the Clouds"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-12 font-bold px-4 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    required
                  />
                </div>

                <div className="grid gap-4">
                  <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                    Step 1: Select State
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                    {statesLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
                      ))
                    ) : (
                      states.map((state) => (
                        <button
                          key={state.id}
                          type="button"
                          onClick={() => {
                              setFormData({ ...formData, state_id: state.id, destination_ids: [] });
                              setExploreWholeState(false);
                          }}
                          className={cn(
                            "p-3 rounded-xl border transition-all text-xs font-bold text-center",
                            formData.state_id === state.id
                              ? "border-primary bg-primary/10 text-primary shadow-sm"
                              : "border-border/50 hover:border-primary/40 hover:bg-muted/30 text-muted-foreground font-medium"
                          )}
                        >
                          {state.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {formData.state_id && (circuitsLoading || circuits.length > 0) && (
                  <div className="grid gap-4 border-t border-border/40 pt-6 mt-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary" />
                      Backpacker Travel Circuits
                    </label>
                    <p className="text-xs text-muted-foreground -mt-2">
                      Choose a predefined backpacking circuit to automatically populate stops, recommended stay durations, travel modes, and trigger an optimized AI streaming generation.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {circuitsLoading ? (
                        Array(2).fill(0).map((_, i) => (
                          <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" />
                        ))
                      ) : (
                        circuits.map((circuit) => {
                          const isSelected = selectedCircuitId === circuit.id;
                          const advisory = isSelected ? getSeasonalAdvisory(circuit) : null;
                          return (
                            <div key={circuit.id} className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedCircuitId(null);
                                    setFormData(prev => ({ ...prev, destination_ids: [] }));
                                  } else {
                                    handleSelectCircuit(circuit);
                                  }
                                }}
                                className={cn(
                                  "group relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all text-left bg-card w-full",
                                  isSelected
                                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                                    : "border-border/50 hover:border-primary/40"
                                )}
                              >
                                <div className="relative h-28 w-full overflow-hidden">
                                  <img
                                    src={circuit.coverImage || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&q=70"}
                                    alt={circuit.circuitName}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                                  <div className="absolute bottom-2 left-3 right-3">
                                    <h4 className="text-white font-black text-base leading-tight truncate">{circuit.circuitName}</h4>
                                    <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
                                      {circuit.stops?.map(s => s.destination.name).join(" ➔ ") || circuit.destinationState}
                                    </p>
                                  </div>
                                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                                    <Badge className="bg-black/60 hover:bg-black/75 text-[9px] text-white border-none py-0.5 px-2 backdrop-blur-sm">
                                      ★ {circuit.backpackerScore.toFixed(1)}
                                    </Badge>
                                    {isSelected && (
                                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                                        <Check className="h-3 w-3" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="p-3 bg-muted/20 flex-grow flex flex-col justify-between gap-2">
                                  <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                                    {circuit.description || `Discover the backpacking trails of ${circuit.circuitName}.`}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1">
                                    <Badge variant="outline" className="text-[9px] font-bold border-primary/20 text-primary py-0 h-4 bg-primary/5">
                                      {circuit.recommendedDuration} Days
                                    </Badge>
                                    {circuit.estimatedBudget && (
                                      <Badge variant="outline" className="text-[9px] font-bold border-emerald-500/20 text-emerald-600 py-0 h-4 bg-emerald-500/5">
                                        ₹{circuit.estimatedBudget.toLocaleString()} Budget
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="text-[9px] font-bold border-purple-500/20 text-purple-600 py-0 h-4 uppercase bg-purple-500/5">
                                      {circuit.difficultyLevel}
                                    </Badge>
                                    {circuit.tags && Array.isArray(circuit.tags) && circuit.tags.slice(0, 2).map((tag: string) => (
                                      <Badge key={tag} variant="secondary" className="text-[9px] py-0 h-4 bg-muted text-muted-foreground border-none">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </button>
                              
                              {/* Seasonal Advisory Card */}
                              {advisory && (
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={cn(
                                    "p-3 rounded-xl border text-xs leading-relaxed",
                                    advisory.status === 'ideal' 
                                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                      : advisory.status === 'warning'
                                        ? "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400"
                                        : "bg-destructive/5 border-destructive/20 text-destructive"
                                  )}
                                >
                                  <div className="font-bold flex items-center gap-1.5 uppercase tracking-wide text-[9px] mb-1">
                                    {advisory.status === 'ideal' ? '☀️ Perfect Season' : advisory.status === 'warning' ? '⚠️ Seasonal Warning' : '❌ Season Avoid'} ({advisory.season})
                                  </div>
                                  <p className="text-[10px] font-medium">{advisory.warningNote || "Ideal weather for backpacking this circuit!"}</p>
                                  {advisory.tips && Array.isArray(advisory.tips) && advisory.tips.length > 0 && (
                                    <ul className="list-disc pl-4 mt-1 text-[9px] space-y-0.5">
                                      {advisory.tips.map((tip, idx) => (
                                        <li key={idx}>{tip}</li>
                                      ))}
                                    </ul>
                                  )}
                                </motion.div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                <div className="grid gap-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">
                      Step 2: Choose Destinations
                    </label>
                    {formData.state_id && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Explore Whole State</span>
                        <button
                          type="button"
                          onClick={() => setExploreWholeState(!exploreWholeState)}
                          className={cn(
                            "relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            exploreWholeState ? "bg-primary" : "bg-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
                              exploreWholeState ? "translate-x-5" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {destLoading ? (
                      formData.state_id ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
                        ))
                      ) : (
                        <div className="col-span-full py-12 text-center text-muted-foreground text-sm font-medium bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                            Select a state first to see destinations
                        </div>
                      )
                    ) : destinations.length > 0 ? (
                      destinations.map((dest) => {
                        const isSelected = formData.destination_ids.includes(dest.id);
                        return (
                          <button
                            key={dest.id}
                            type="button"
                            disabled={exploreWholeState}
                            onClick={() => {
                                const newIds = isSelected 
                                    ? formData.destination_ids.filter(id => id !== dest.id)
                                    : [...formData.destination_ids, dest.id];
                                setFormData({ ...formData, destination_ids: newIds });
                            }}
                            className={cn(
                              "group relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all text-left",
                              isSelected
                                ? "border-primary ring-2 ring-primary/20 shadow-lg"
                                : "border-border/50 hover:border-primary/40",
                              exploreWholeState && "opacity-80"
                            )}
                          >
                            <div className="relative h-32 w-full overflow-hidden">
                              <img 
                                src={dest.image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&q=70"} 
                                alt={dest.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <div className="absolute bottom-3 left-3 right-3">
                                <h3 className="text-white font-black text-lg leading-tight truncate">{dest.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className="bg-white/20 hover:bg-white/30 text-[10px] text-white border-none py-0 px-2 h-4 backdrop-blur-sm">
                                    {dest.avg_days || 2} Days
                                  </Badge>
                                </div>
                              </div>
                              {isSelected && !exploreWholeState && (
                                <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                                  <Check className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="p-3 bg-card flex-grow">
                              <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                                {dest.description || `Discover the amazing attractions of ${dest.name}.`}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-12 text-center text-muted-foreground text-sm font-medium bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                          {formData.state_id ? "No destinations found for this state" : "Select a state first"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="startDate" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Start Date
                    </label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="h-12 font-medium bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="endDate" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      End Date
                    </label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="h-12 font-medium bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Travel Style & Type */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-none shadow-sm ring-1 ring-border/50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Travel Type</CardTitle>
                  <CardDescription>What kind of experience are you looking for?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {TRAVEL_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isActive = Array.isArray(formData.type)
                        ? formData.type.includes(type.value)
                        : formData.type === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          id={`type-${type.value}`}
                          onClick={() => {
                            const currentTypes = Array.isArray(formData.type) ? formData.type : [formData.type];
                            const nextTypes = currentTypes.includes(type.value)
                              ? currentTypes.filter(t => t !== type.value)
                              : [...currentTypes, type.value];
                            
                            // Keep at least one travel type selected
                            if (nextTypes.length === 0) return;
                            setFormData({ ...formData, type: nextTypes });
                          }}
                          className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 gap-2 group",
                            isActive 
                              ? "border-primary bg-primary/5 shadow-md shadow-primary/10" 
                              : "border-border/50 border-dashed hover:border-primary/40 hover:bg-muted/30"
                          )}
                        >
                          <div className={cn("p-2 rounded-xl transition-colors", isActive ? type.bg : "bg-muted group-hover:bg-muted/50")}>
                            <Icon className={cn("h-6 w-6", isActive ? type.color : "text-muted-foreground")} />
                          </div>
                          <span className={cn("text-sm font-bold", isActive ? "text-primary" : "text-muted-foreground")}>
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm ring-1 ring-border/50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Travel Style</CardTitle>
                  <CardDescription>How intense should the itinerary be?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {TRAVEL_STYLES.map((style) => {
                      const isActive = formData.style === style.value;
                      return (
                        <button
                          key={style.value}
                          type="button"
                          id={`style-${style.value}`}
                          onClick={() => setFormData({ ...formData, style: style.value })}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left",
                            isActive 
                              ? "border-primary bg-primary/5" 
                              : "border-border/50 hover:bg-muted/30"
                          )}
                        >
                          <div>
                            <div className={cn("font-bold", isActive ? "text-primary" : "text-foreground")}>
                              {style.label}
                            </div>
                            <div className="text-xs text-muted-foreground">{style.desc}</div>
                          </div>
                          {isActive && <div className="h-4 w-4 rounded-full bg-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Generation Trigger */}
            <div className="flex flex-col items-center py-4 gap-4">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleGenerateAI}
                    disabled={isGenerating || (user?.plan === 'FREE' && user.activeTripCount >= (1 + (user.extraItinerarySlots || 0)))}
                    className={cn(
                      "h-14 rounded-2xl px-10 border-2 transition-all group relative overflow-hidden",
                      (user?.plan === 'FREE' && user.activeTripCount >= (1 + (user.extraItinerarySlots || 0)))
                        ? "border-destructive/20 bg-destructive/5 text-destructive cursor-not-allowed opacity-50"
                        : "border-primary/20 hover:border-primary hover:bg-primary/5"
                    )}
                >
                    <div className="flex items-center gap-3">
                        {isGenerating ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        ) : (
                            <Sparkles className={cn(
                              "h-5 w-5 group-hover:scale-125 transition-transform",
                              (user?.plan === 'FREE' && user.activeTripCount >= (1 + (user.extraItinerarySlots || 0))) ? "text-destructive" : "text-primary"
                            )} />
                        )}
                        <span className="font-black text-lg tracking-tight">
                          {formData.destination_ids.length > 1 ? "Generate Multi-Dest Itinerary" : "Generate Smart Itinerary"}
                        </span>
                    </div>
                </Button>
                {user?.plan === 'FREE' && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full border border-border/50">
                      AI Quota: <span className={cn(user.aiGenerationsCount >= 3 ? "text-destructive" : "text-primary")}>{user.aiGenerationsCount} / 3</span>
                    </div>
                    {user.activeTripCount >= (1 + (user.extraItinerarySlots || 0)) && (
                      <span className="text-[9px] font-bold text-destructive uppercase tracking-widest animate-pulse">
                        ⚠️ Itinerary Limit Reached
                      </span>
                    )}
                  </div>
                )}
                {formData.destination_ids.length > 1 && (
                  <div className="text-xs font-medium text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/20 text-center max-w-sm">
                    🧠 AI will smartly allocate days across your {formData.destination_ids.length} destinations
                  </div>
                )}
            </div>

            {/* Real-time Stage Progress & Streaming Indicator */}
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="relative w-full"
                    >
                      <Card className="border-none ring-1 ring-primary/30 bg-primary/5 backdrop-blur-sm overflow-hidden">
                        <div className="p-5">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              <span className="text-xs font-black uppercase tracking-widest text-primary">
                                {currentStage || "Travenic AI is crafting your itinerary..."}
                              </span>
                            </div>
                            <span className="text-xs font-black text-primary">{percentage}%</span>
                          </div>
                          
                          {/* Smooth dynamic progress bar */}
                          <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden mb-3">
                            <motion.div 
                              className="h-full bg-primary" 
                              initial={{ width: "0%" }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                          </div>

                          {streamText && (
                            <div className="font-mono text-[9px] text-muted-foreground max-h-16 overflow-hidden leading-relaxed opacity-40">
                              {streamText.slice(-300)}
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Failure Recovery UI */}
            <AnimatePresence>
                {isFailed && !isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="relative w-full"
                    >
                      <Card className="border-none ring-1 ring-destructive/30 bg-destructive/5 backdrop-blur-sm overflow-hidden">
                        <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-destructive flex items-center gap-1.5">
                              ⚠️ Generation Interrupted
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {progressiveDays.length > 0 
                                ? `Successfully cached ${progressiveDays.length} days. You can resume without losing your progress!`
                                : "An error occurred. Please try again to restart your generation."
                              }
                            </p>
                          </div>
                          <Button
                            type="button"
                            onClick={handleGenerateAI}
                            className="bg-destructive hover:bg-destructive/90 text-white font-bold shadow-md shadow-destructive/10"
                          >
                            🔄 {progressiveDays.length > 0 ? "Resume Generation" : "Retry Generation"}
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Itinerary Preview */}
            <AnimatePresence>
                {(aiItinerary || progressiveDays.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start"
                    >
                        <div className="lg:col-span-7 space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <h2 className="text-2xl font-black font-heading italic">AI Suggestions</h2>
                              {aiMeta && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[9px] font-bold py-0 h-5">
                                    {aiMeta.model?.split('-').slice(0, 2).join('-') || 'AI'}
                                  </Badge>
                                  {aiMeta.latencyMs && (
                                    <Badge variant="outline" className="text-[9px] font-bold py-0 h-5 text-muted-foreground">
                                      {(aiMeta.latencyMs / 1000).toFixed(1)}s
                                    </Badge>
                                  )}
                                  {aiMeta.cached && (
                                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] font-bold py-0 h-5">
                                      ⚡ Cached
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => { 
                                  setAiItinerary(null); 
                                  setAiExtras(null); 
                                  setAiMeta(null); 
                                  setProgressiveDays([]); 
                                  setIsFailed(false);
                                }}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" /> Clear
                            </Button>
                        </div>

                        {/* Budget & Packing Tips */}
                        {aiExtras && (
                          <div className="space-y-4 w-full">
                            <div className="grid sm:grid-cols-2 gap-4">
                              {aiExtras.budgetEstimate && (
                                <Card className="border-none ring-1 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm">
                                  <div className="p-5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-1.5">
                                      <span className="text-sm">💰</span> Budget Estimate
                                    </div>
                                    <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                                      ₹{aiExtras.budgetEstimate.perPersonPerDay?.toLocaleString()}
                                      <span className="text-xs font-bold text-emerald-600/60 ml-1">/person/day</span>
                                    </div>
                                    {aiExtras.budgetEstimate.breakdown && (
                                      <div className="text-[10px] text-emerald-600/80 mt-2 leading-relaxed bg-emerald-100/35 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200/40">{aiExtras.budgetEstimate.breakdown}</div>
                                    )}
                                  </div>
                                </Card>
                              )}
                              {aiExtras.smartPacking ? (
                                <Card className="border-none ring-1 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm">
                                  <div className="p-5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3 flex items-center gap-1.5">
                                      <Briefcase className="h-4 w-4 text-blue-600 animate-pulse" /> Smart Packing Guide
                                    </div>
                                    <div className="grid grid-cols-1 gap-2.5">
                                      {/* Essentials */}
                                      {aiExtras.smartPacking.essentialItems?.length > 0 && (
                                        <div className="text-[10.5px]">
                                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mr-1.5">[Essentials]:</span>
                                          <span className="text-muted-foreground">{aiExtras.smartPacking.essentialItems.join(', ')}</span>
                                        </div>
                                      )}
                                      {/* Recommended */}
                                      {aiExtras.smartPacking.recommendedItems?.length > 0 && (
                                        <div className="text-[10.5px]">
                                          <span className="font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider mr-1.5">[Recommended]:</span>
                                          <span className="text-muted-foreground">{aiExtras.smartPacking.recommendedItems.join(', ')}</span>
                                        </div>
                                      )}
                                      {/* Optional */}
                                      {aiExtras.smartPacking.optionalItems?.length > 0 && (
                                        <div className="text-[10.5px]">
                                          <span className="font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider mr-1.5">[Optional]:</span>
                                          <span className="text-muted-foreground">{aiExtras.smartPacking.optionalItems.join(', ')}</span>
                                        </div>
                                      )}
                                    </div>
                                    {aiExtras.bestTimeToVisit && (
                                      <div className="text-[10px] text-blue-600/80 mt-3 font-semibold flex items-center gap-1">
                                        <span>🗓</span> Best time: {aiExtras.bestTimeToVisit}
                                      </div>
                                    )}
                                  </div>
                                </Card>
                              ) : (
                                aiExtras.packingTips && aiExtras.packingTips.length > 0 && (
                                  <Card className="border-none ring-1 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm">
                                    <div className="p-4">
                                      <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">🎒 Packing Tips</div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {aiExtras.packingTips.map((tip, i) => (
                                          <Badge key={i} variant="outline" className="text-[10px] bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                            {tip}
                                          </Badge>
                                        ))}
                                      </div>
                                      {aiExtras.bestTimeToVisit && (
                                        <div className="text-[10px] text-blue-600/80 mt-2">🗓 Best time: {aiExtras.bestTimeToVisit}</div>
                                      )}
                                    </div>
                                  </Card>
                                )
                              )}
                            </div>

                            {/* Local Experience Suggestions (Backpacker Friend Guides) */}
                            {aiExtras.localExperiences && Object.keys(aiExtras.localExperiences).length > 0 && (
                              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
                                {Object.entries(aiExtras.localExperiences).map(([destName, exp]: [string, any]) => (
                                  <Card key={destName} className="border-none ring-1 ring-violet-500/15 bg-violet-50/30 dark:bg-violet-950/10 backdrop-blur-sm shadow-sm overflow-hidden rounded-2xl">
                                    <div className="p-5">
                                      <div className="text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-3 flex items-center gap-1.5 border-b border-violet-100 dark:border-violet-900/30 pb-2">
                                        <Compass className="h-4 w-4 text-violet-600" />
                                        <span>🗺️ Local Guide: {destName}</span>
                                      </div>
                                      
                                      <div className="space-y-3.5">
                                        {exp.bestLocalFood && (
                                          <div className="flex gap-2.5 items-start">
                                            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                              <Utensils className="h-3.5 w-3.5" />
                                            </div>
                                            <div>
                                              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Best Local Food</div>
                                              <p className="text-[10.5px] text-muted-foreground mt-0.5 leading-relaxed">{exp.bestLocalFood}</p>
                                            </div>
                                          </div>
                                        )}

                                        {exp.localEtiquette && (
                                          <div className="flex gap-2.5 items-start">
                                            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                              <BookOpen className="h-3.5 w-3.5" />
                                            </div>
                                            <div>
                                              <div className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Local Etiquette</div>
                                              <p className="text-[10.5px] text-muted-foreground mt-0.5 leading-relaxed">{exp.localEtiquette}</p>
                                            </div>
                                          </div>
                                        )}

                                        {exp.hiddenGem && (
                                          <div className="flex gap-2.5 items-start">
                                            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                                              <Gem className="h-3.5 w-3.5" />
                                            </div>
                                            <div>
                                              <div className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Hidden Gem</div>
                                              <p className="text-[10.5px] text-muted-foreground mt-0.5 leading-relaxed">{exp.hiddenGem}</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            )}

                            {/* Backpacker Hostels & Social Hubs Suggestions */}
                            {aiExtras.hostels && Object.keys(aiExtras.hostels).length > 0 && (
                              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
                                {Object.entries(aiExtras.hostels).map(([destName, list]: [string, any[]]) => (
                                  <Card key={destName} className="border-none ring-1 ring-cyan-500/15 bg-cyan-50/30 dark:bg-cyan-950/10 backdrop-blur-sm shadow-sm overflow-hidden rounded-2xl">
                                    <div className="p-5">
                                      <div className="text-xs font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-3 flex items-center gap-1.5 border-b border-cyan-100 dark:border-cyan-900/30 pb-2">
                                        <Home className="h-4 w-4 text-cyan-600" />
                                        <span>🏠 Social Stays: {destName}</span>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        {list.map((item, idx) => (
                                          <div key={idx} className="p-3 rounded-xl bg-background/60 dark:bg-muted/30 border border-cyan-500/10 hover:border-cyan-500/25 transition-all duration-300">
                                            <div className="flex items-start justify-between gap-1">
                                              <span className="text-[11.5px] font-extrabold text-foreground flex items-center gap-1">
                                                {item.type === 'hostel' ? <Home className="h-3 w-3 text-cyan-500" /> : <Coffee className="h-3 w-3 text-amber-500" />}
                                                {item.name}
                                              </span>
                                              <Badge className="text-[8px] font-black py-0.5 px-1.5 h-auto border-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                                                ★ {item.socialRating}/10
                                              </Badge>
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                              <Badge className="text-[8px] font-bold py-0.5 px-1.5 h-auto border-none bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                                {item.estimatedPrice}
                                              </Badge>
                                              <Badge className="text-[8px] font-bold py-0.5 px-1.5 h-auto border-none bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                                {item.vibe}
                                              </Badge>
                                            </div>

                                            <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                                              {item.description}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Day allocation for multi-dest */}
                        {aiExtras?.dayAllocation && (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(aiExtras.dayAllocation).map(([dest, days]) => (
                              <Badge key={dest} className="bg-primary/10 text-primary border-primary/20 font-bold text-xs py-1 px-3">
                                📍 {dest}: {days} {days === 1 ? 'day' : 'days'}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="grid gap-4">
                            {(aiItinerary || progressiveDays).filter(Boolean).map((day, dayIdx) => (
                                <motion.div
                                    key={day.day}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: dayIdx * 0.1 }}
                                >
                                <Card className="border-none ring-1 ring-border/50 bg-background/50 backdrop-blur-sm">
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge className="bg-primary/10 text-primary border-none font-bold">Day {day.day}</Badge>
                                            {day.theme && (
                                              <span className="text-xs font-bold text-muted-foreground italic">{day.theme}</span>
                                            )}
                                            {day.destination && (
                                              <Badge variant="outline" className="text-[9px] font-bold ml-auto">📍 {day.destination}</Badge>
                                            )}
                                        </div>
                                        {day.reasoning && (
                                          <p className="text-[11px] text-muted-foreground mb-3 italic leading-relaxed">{day.reasoning}</p>
                                        )}
                                        {day.travelNote && (
                                          <div className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg mb-3 border border-amber-200 dark:border-amber-800">
                                            <div className="flex items-start gap-1.5">
                                              <span className="text-xs">🚗</span>
                                              <div className="flex-1">
                                                {typeof day.travelNote === 'object' ? (
                                                  <div className="space-y-0.5">
                                                    {day.travelNote.travelDistance && <div><span className="font-extrabold uppercase text-[9px] tracking-wider mr-1">[Distance]:</span>{day.travelNote.travelDistance}</div>}
                                                    {day.travelNote.estimatedTravelTime && <div><span className="font-extrabold uppercase text-[9px] tracking-wider mr-1">[Time]:</span>{day.travelNote.estimatedTravelTime}</div>}
                                                    {day.travelNote.recommendedDepartureTime && <div><span className="font-extrabold uppercase text-[9px] tracking-wider mr-1">[Departure]:</span>{day.travelNote.recommendedDepartureTime}</div>}
                                                    {day.travelNote.recommendedStops && Array.isArray(day.travelNote.recommendedStops) && day.travelNote.recommendedStops.length > 0 && (
                                                      <div className="mt-1">
                                                        <div className="font-extrabold uppercase text-[9px] tracking-wider">[Recommended Stops]:</div>
                                                        <ul className="list-disc pl-4 mt-0.5 space-y-0.5 font-medium text-[9.5px] text-amber-700/90 dark:text-amber-400/90">
                                                          {day.travelNote.recommendedStops.map((stop, sIdx) => (
                                                            <li key={sIdx}>
                                                              {typeof stop === 'string' ? stop : `${stop.spotName || stop.name || ''}${stop.reason ? `: ${stop.reason}` : ''}`}
                                                            </li>
                                                          ))}
                                                        </ul>
                                                      </div>
                                                    )}
                                                  </div>
                                                ) : (
                                                  String(day.travelNote)
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {Object.entries(day.slots || {}).map(([slot, data]) => {
                                                 const spotsList = (Array.isArray(data) ? data : [data]).filter(Boolean);
                                                 return (
                                                     <div key={slot} className="space-y-2">
                                                         <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                                                             {slot === 'morning' ? '🌅' : slot === 'afternoon' ? '☀️' : '🌙'} {slot}
                                                         </span>
                                                         <div className="space-y-2">
                                                             {spotsList.map((spotItem: any, spotIdx: number) => (
                                                                 <div key={spotIdx} className="p-3 rounded-xl bg-muted/30 border border-border/50 group hover:border-primary/30 hover:bg-muted/50 transition-all duration-300">
                                                                     <div className="flex items-center justify-between">
                                                                         <span className="text-sm font-bold truncate text-foreground">{spotItem.name}</span>
                                                                         <button type="button" className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                                             <Edit2 className="h-3 w-3" />
                                                                         </button>
                                                                     </div>
                                                                     {spotItem.tip && (
                                                                        <div className="space-y-1">
                                                                          <p className="text-[10.5px] text-muted-foreground mt-1 leading-relaxed">💡 {spotItem.tip}</p>
                                                                          {spotItem.tipDetail && (
                                                                            <div className="flex flex-wrap items-center gap-1.5 mt-1 pb-0.5">
                                                                              <Badge className={cn(
                                                                                "text-[8px] font-bold py-0.5 px-1.5 h-auto border-none flex items-center gap-1 shrink-0 shadow-none",
                                                                                spotItem.tipDetail.confidence === 'High' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                                                                spotItem.tipDetail.confidence === 'Medium' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                                                                "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                                                              )}>
                                                                                <ShieldAlert className="h-2 w-2 shrink-0" />
                                                                                {spotItem.tipDetail.confidence} Trust
                                                                              </Badge>
                                                                              {spotItem.tipDetail.sourceType && (
                                                                                <Badge className="text-[8px] font-bold py-0.5 px-1.5 h-auto border-none bg-muted/80 text-muted-foreground shrink-0 shadow-none">
                                                                                  {spotItem.tipDetail.sourceType.replace(/_/g, ' ')}
                                                                                </Badge>
                                                                              )}
                                                                            </div>
                                                                          )}
                                                                        </div>
                                                                      )}
                                                                     {spotItem.alternative && (
                                                                       <p className="text-[9px] text-primary/60 mt-1">Alt: {spotItem.alternative}</p>
                                                                     )}
                                                                 </div>
                                                             ))}
                                                             {spotsList.length === 0 && (
                                                                 <div className="p-3 rounded-xl bg-muted/10 border border-dashed border-border/30 text-center text-xs text-muted-foreground italic">
                                                                     Free Time
                                                                 </div>
                                                             )}
                                                         </div>
                                                     </div>
                                                 );
                                             })}
                                        </div>
                                    </div>
                                </Card>
                                </motion.div>
                            ))}
                        </div>
                        </div>

                        {/* Right Side: Sticky Route Map */}
                        <div className="lg:col-span-5 h-[400px] lg:h-[600px] lg:sticky lg:top-24 rounded-2xl border border-border/50 shadow-lg overflow-hidden bg-background/50 backdrop-blur-md p-4 flex flex-col gap-3 w-full">
                            <div className="flex items-center gap-2.5 bg-background/80 backdrop-blur-md p-2.5 rounded-xl border border-border/40 shadow-sm z-10">
                                <MapPinIcon className="h-4 w-4 text-primary animate-bounce shrink-0" />
                                <div>
                                    <h3 className="font-extrabold text-xs uppercase tracking-wider">Live Route Tracker</h3>
                                    <p className="text-[10px] text-muted-foreground">{uniqueMapLocations.length} spots mapped in real time</p>
                                </div>
                            </div>
                            <div className="flex-1 w-full rounded-xl overflow-hidden relative border border-border/30">
                                <MapRoute locations={uniqueMapLocations} className="w-full h-full" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Travelers */}
            <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Travelers
                </CardTitle>
                <CardDescription>How many people are coming along?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-8 py-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    id="traveller-decrease"
                    className="h-12 w-12 rounded-full border-2"
                    onClick={() => setFormData({ ...formData, traveler_count: Math.max(1, formData.traveler_count - 1) })}
                  >
                    -
                  </Button>
                  <div className="text-5xl font-black font-heading tracking-tighter w-16 text-center">
                    {formData.traveler_count}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    id="traveller-increase"
                    className="h-12 w-12 rounded-full border-2"
                    onClick={() => setFormData({ ...formData, traveler_count: formData.traveler_count + 1 })}
                  >
                    +
                  </Button>
                </div>
                <div className="text-center text-sm font-medium text-muted-foreground mt-2 italic">
                  {formData.traveler_count === 1 ? "Just you on this quest!" : `A group of ${formData.traveler_count} adventurers.`}
                </div>
              </CardContent>
            </Card>

            {/* Starting Your Journey */}
            <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Plane className="h-5 w-5 text-primary" />
                    Starting Your Journey
                  </CardTitle>
                  <CardDescription>Tell us how you're arriving at your destination.</CardDescription>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFormData({ ...formData, skip_start_details: !formData.skip_start_details })}
                  className={cn(
                    "rounded-xl border-primary/20",
                    formData.skip_start_details ? "hover:bg-primary/5 hover:text-primary text-muted-foreground" : "bg-primary text-primary-foreground"
                  )}
                >
                  {formData.skip_start_details ? "Add Details" : "Skip For Now"}
                </Button>
              </CardHeader>
              <AnimatePresence>
                {!formData.skip_start_details && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="grid gap-6 p-6">
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { mode: 'flight', icon: Plane, label: 'Flight', emoji: '✈️', color: 'text-blue-500', bg: 'bg-blue-50' },
                          { mode: 'train', icon: TrainFront, label: 'Train', emoji: '🚆', color: 'text-orange-500', bg: 'bg-orange-50' },
                          { mode: 'bus', icon: Bus, label: 'Bus', emoji: '🚌', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                          { mode: 'car', icon: Car, label: 'Car', emoji: '🚗', color: 'text-purple-500', bg: 'bg-purple-50' },
                        ].map((m) => {
                          const Icon = m.icon;
                          const isActive = formData.start_details.mode === m.mode;
                          return (
                            <button
                              key={m.mode}
                              type="button"
                               id={`start-mode-${m.mode}`}
                              onClick={() => setFormData({
                                ...formData,
                                start_details: { ...formData.start_details, mode: m.mode as any }
                              })}
                              className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1",
                                isActive 
                                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10" 
                                  : "border-border/50 border-dashed hover:border-primary/40 hover:bg-muted/30"
                              )}
                            >
                              <div className={cn("p-2 rounded-xl", isActive ? m.bg : "bg-muted")}>
                                <Icon className={cn("h-5 w-5", isActive ? m.color : "text-muted-foreground")} />
                              </div>
                              <span className={cn("text-[10px] font-black uppercase tracking-tighter", isActive ? "text-primary" : "text-muted-foreground")}>
                                {m.label} {m.emoji}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">From</label>
                          <Input
                            placeholder="Current city or airport"
                            value={formData.start_details.from_location}
                            onChange={(e) => setFormData({
                              ...formData,
                              start_details: { ...formData.start_details, from_location: e.target.value }
                            })}
                            className="bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                            required={!formData.skip_start_details}
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">To</label>
                          <Input
                            placeholder="Destination city"
                            value={formData.start_details.to_location}
                            onChange={(e) => setFormData({
                              ...formData,
                              start_details: { ...formData.start_details, to_location: e.target.value }
                            })}
                            className="bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                            required={!formData.skip_start_details}
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Arrival Time</label>
                        <Input
                          type="datetime-local"
                          value={formData.start_details.arrival_time}
                          onChange={(e) => setFormData({
                            ...formData,
                            start_details: { ...formData.start_details, arrival_time: e.target.value }
                          })}
                          className="bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                          required={!formData.skip_start_details}
                        />
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* How will you return? */}
            <Card className="border-none shadow-sm ring-1 ring-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <ArrowLeft className="h-5 w-5 text-primary" />
                    How will you return?
                  </CardTitle>
                  <CardDescription>Tell us about your journey back home.</CardDescription>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setFormData({ ...formData, skip_end_details: !formData.skip_end_details })}
                  className={cn(
                    "rounded-xl border-primary/20",
                    formData.skip_end_details ? "hover:bg-primary/5 hover:text-primary text-muted-foreground" : "bg-primary text-primary-foreground"
                  )}
                >
                  {formData.skip_end_details ? "Add Details" : "Skip For Now"}
                </Button>
              </CardHeader>
              <AnimatePresence>
                {!formData.skip_end_details && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="grid gap-6 p-6">
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { mode: 'flight', icon: Plane, label: 'Flight', emoji: '✈️', color: 'text-blue-500', bg: 'bg-blue-50' },
                          { mode: 'train', icon: TrainFront, label: 'Train', emoji: '🚆', color: 'text-orange-500', bg: 'bg-orange-50' },
                          { mode: 'bus', icon: Bus, label: 'Bus', emoji: '🚌', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                          { mode: 'car', icon: Car, label: 'Car', emoji: '🚗', color: 'text-purple-500', bg: 'bg-purple-50' },
                        ].map((m) => {
                          const Icon = m.icon;
                          const isActive = formData.end_details.mode === m.mode;
                          return (
                            <button
                              key={m.mode}
                              type="button"
                               id={`end-mode-${m.mode}`}
                              onClick={() => setFormData({
                                ...formData,
                                end_details: { ...formData.end_details, mode: m.mode as any }
                              })}
                              className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1",
                                isActive 
                                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10" 
                                  : "border-border/50 border-dashed hover:border-primary/40 hover:bg-muted/30"
                              )}
                            >
                              <div className={cn("p-2 rounded-xl", isActive ? m.bg : "bg-muted")}>
                                <Icon className={cn("h-5 w-5", isActive ? m.color : "text-muted-foreground")} />
                              </div>
                              <span className={cn("text-[10px] font-black uppercase tracking-tighter", isActive ? "text-primary" : "text-muted-foreground")}>
                                {m.label} {m.emoji}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">To</label>
                          <Input
                            placeholder="Home city or airport"
                            value={formData.end_details.to_location}
                            onChange={(e) => setFormData({
                              ...formData,
                              end_details: { ...formData.end_details, to_location: e.target.value }
                            })}
                            className="bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                            required={!formData.skip_end_details}
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Departure Time</label>
                          <Input
                            type="datetime-local"
                            value={formData.end_details.departure_time}
                            onChange={(e) => setFormData({
                              ...formData,
                              end_details: { ...formData.end_details, departure_time: e.target.value }
                            })}
                            className="bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                            required={!formData.skip_end_details}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20"
              >
                {error}
              </motion.div>
            )}

            <div className="flex items-center justify-end gap-4 mt-4">
              <Button type="button" variant="ghost" onClick={() => router.back()} className="h-12 px-8 font-bold">
                Cancel
              </Button>
              <div className="relative group">
                <Button 
                  type="submit" 
                  id="launch-journey"
                  disabled={loading || (user?.plan === 'FREE' && user.activeTripCount >= (1 + (user.extraItinerarySlots || 0)))}
                  className={cn(
                    "h-12 px-12 rounded-xl font-bold text-lg shadow-xl group gap-2",
                    (user?.plan === 'FREE' && user.activeTripCount >= (1 + (user.extraItinerarySlots || 0)))
                      ? "bg-muted text-muted-foreground shadow-none cursor-not-allowed"
                      : "shadow-primary/30"
                  )}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {user?.plan === 'FREE' && user.activeTripCount >= (1 + (user.extraItinerarySlots || 0)) ? "Limit Reached" : "Launch Journey"}
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <PremiumUpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSuccess={() => {
          setIsUpgradeModalOpen(false);
          if (typeof window !== 'undefined') {
            useAuthStore.getState().checkAuth();
          }
          toast.success("Upgrade successful! Your new quota is active.");
        }}
      />
    </Section>
  );
}
