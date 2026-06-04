"use client";

import { use, useState, useEffect } from "react";
import { Section } from "@/components/ui/section";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Coffee,
  Camera,
  Utensils,
  Sparkles,
  Info,
  AlertTriangle,
  MoveUpRight,
  Plane,
  TrainFront,
  Bus,
  Car,
  ChevronRight,
  CheckCircle2,
  Navigation,
  ExternalLink,
  Star,
  Loader2,
  AlertCircle,
  Timer,
  Route,
  Activity,
  Zap,
  CloudRain,
  Sun,
  Plus,
  Receipt,
  ShoppingBag,
  History,
  CloudLightning,
  Umbrella
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { tripService, ItineraryDayTimeline, Trip, ItinerarySpot, ItineraryBlock } from "@/services/trip.service";
import { bookingService, Booking } from "@/services/booking.service";
import MapRoute, { MapLocation } from "@/components/ui/MapRoute";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StartDetailsModal } from "@/components/ui/StartDetailsModal";
import { ReturnDetailsModal } from "@/components/ui/ReturnDetailsModal";
// import { NearbySuggestions } from "@/components/itinerary/NearbySuggestions";
import { ActivitySuggestions } from "@/components/itinerary/ActivitySuggestions";
import { SortableBlock } from "@/components/itinerary/SortableBlock";
import { ItemChatSection } from "@/components/ui/ItemChatSection";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

function DroppableSlot({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: 'SLOT',
    }
  });

  return (
    <div 
      ref={setNodeRef} 
      className={cn(
        className,
        isOver ? "ring-4 ring-primary/20 bg-primary/5 rounded-[3rem] transition-all duration-300" : ""
      )}
    >
      {children}
    </div>
  );
}

export default function DayGuidePage({ params }: { params: Promise<{ tripId: string, day: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [data, setData] = useState<ItineraryDayTimeline | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartDetailsModalOpen, setIsStartDetailsModalOpen] = useState(false);
  const [isReturnDetailsModalOpen, setIsReturnDetailsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Live Mode states
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<{ temp: number, condition: string, icon: string } | null>(null);
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);
  const [guideData, setGuideData] = useState<{ advice: string, packingTip: string } | null>(null);
  const [isGuideLoading, setIsGuideLoading] = useState(false);
  const [lastAdvisedSpotId, setLastAdvisedSpotId] = useState<string | null>(null);

  const isTripPassed = () => {
    if (!trip) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripEnd = new Date(trip.endDate);
    tripEnd.setHours(0, 0, 0, 0);
    return today > tripEnd;
  };

  const isDayPassed = () => {
    if (!trip) return false;
    const dayNumber = parseInt(resolvedParams.day);
    const tripDay = trip.tripDays?.find((d: { dayNumber: number }) => d.dayNumber === dayNumber);
    const itDay = trip.itineraryDays?.find((d: { dayNumber: number }) => d.dayNumber === dayNumber);
    const dayDateStr = tripDay?.date || itDay?.date;
    if (!dayDateStr) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDate = new Date(dayDateStr);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate < today;
  };

  const isLocked = isTripPassed() || isDayPassed();

  // Exit editing mode if locked
  useEffect(() => {
    if (isLocked) {
      setIsEditing(false);
    }
  }, [isLocked]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchDayData = async () => {
    try {
      setLoading(true);
      // 1. Fetch trip to get the correct tripDayId for the day number
      const tripData: Trip = await tripService.getTrip(resolvedParams.tripId);
      setTrip(tripData);
      const dayNumber = parseInt(resolvedParams.day);

      // Find the correct day ID, falling back to legacy tripDays if necessary
      const itDay = tripData.itineraryDays?.find((d: { dayNumber: number }) => d.dayNumber === dayNumber);
      const tripDay = tripData.tripDays?.find((d: { dayNumber: number }) => d.dayNumber === dayNumber);

      const targetDayId = itDay?.id || tripDay?.id;

      if (!targetDayId) {
        throw new Error("Timeline not found for this day.");
      }

      // 2. Fetch the detailed timeline
      const timelineData = await tripService.getDayTimeline(resolvedParams.tripId, targetDayId);
      
      // Calculate active slots based on arrival time (Day 1 only)
      if (timelineData.day_number === 1 && tripData.startDetails?.arrivalTime) {
        const arrivalDate = new Date(tripData.startDetails.arrivalTime);
        const arrivalHour = arrivalDate.getHours();
        const arrivalMinute = arrivalDate.getMinutes();
        const arrivalTotalMinutes = arrivalHour * 60 + arrivalMinute;

        timelineData.slots = timelineData.slots.map(slot => {
          let isActive = true;
          if (arrivalTotalMinutes > 16 * 60) {
            if (slot.slot_type === 'MORNING' || slot.slot_type === 'AFTERNOON') isActive = false;
          } else if (arrivalTotalMinutes > 12 * 60) {
            if (slot.slot_type === 'MORNING') isActive = false;
          }
          return { ...slot, isActive };
        });
      } else {
        timelineData.slots = timelineData.slots.map(slot => ({ ...slot, isActive: true }));
      }

      // Calculate active slots based on return time (Last Day only)
      const totalDays = tripData.tripDays?.length || 0;
      if (timelineData.day_number === totalDays && timelineData.day_number !== 0 && tripData.endDetails?.departureTime) {
        const departureDate = new Date(tripData.endDetails.departureTime);
        const departureHour = departureDate.getHours();
        
        // Calculate buffer based on mode
        let bufferMinutes = 0;
        if (tripData.endDetails.mode === 'flight') bufferMinutes = 120;
        else if (['train', 'bus'].includes(tripData.endDetails.mode)) bufferMinutes = 60;

        const adjustedDepartureTotalMinutes = (departureHour * 60 + departureDate.getMinutes()) - bufferMinutes;

        timelineData.slots = timelineData.slots.map(slot => {
          if (slot.isActive === false) return slot; // Already disabled by arrival logic (if it was a 1-day trip)

          let isActive = true;
          
          // 1. Categorical thresholds from user
          if (departureHour < 12) {
            if (slot.slot_type === 'AFTERNOON' || slot.slot_type === 'EVENING') isActive = false;
          } else if (departureHour <= 17) {
            if (slot.slot_type === 'EVENING') isActive = false;
          }
          // departureHour > 18 remains full day allowed by default

          // 2. Buffer-based strict check
          // Morning ends at 13:00 (780 mins), Afternoon at 17:00 (1020 mins), Evening at 21:00 (1260 mins)
          const slotEndTimeMinutes = slot.slot_type === 'MORNING' ? 13 * 60 : slot.slot_type === 'AFTERNOON' ? 17 * 60 : 21 * 60;
          
          if (slotEndTimeMinutes > adjustedDepartureTotalMinutes) {
            isActive = false;
          }

          return { ...slot, isActive };
        });
      }
      
      setData(timelineData);

      // 3. Fetch user bookings to check status
      const bookingsRes = await bookingService.getUserBookings();
      const relevantBookings = (bookingsRes.bookings || []).filter(
        (b: any) => b.tripId === resolvedParams.tripId &&
                   !['CANCELLED', 'REFUNDED', 'REJECTED', 'EXPIRED', 'REFUND_PROCESSING', 'REFUND_FAILED'].includes(b.status)
      );
      setUserBookings(relevantBookings);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to load day guide.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDayData();
  }, [resolvedParams.tripId, resolvedParams.day]);

  useEffect(() => {
    if (trip) {
      const dayNumber = parseInt(resolvedParams.day);
      const tripDay = trip.tripDays?.find((d: any) => d.dayNumber === dayNumber);
      const itDay = trip.itineraryDays?.find((d: any) => d.dayNumber === dayNumber);
      const dayDateStr = tripDay?.date || itDay?.date;
      
      if (dayDateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayDate = new Date(dayDateStr);
        dayDate.setHours(0, 0, 0, 0);
        
        if (today.getTime() === dayDate.getTime()) {
          if (!isLiveMode) {
            setIsLiveMode(true);
            if (isEditing) setIsEditing(false);
            if (trip.status !== 'ONGOING') {
              tripService.updateTripStatus(resolvedParams.tripId, "ONGOING").catch(() => {});
            }
          }
        } else {
          if (isLiveMode) {
            setIsLiveMode(false);
          }
        }
      }
    }
  }, [trip, resolvedParams.day, resolvedParams.tripId, isLiveMode, isEditing]);

  const allBlocks = data?.slots?.flatMap(s => s.blocks || []) || [];

  const getCurrentSlotType = () => {
    const hours = currentTime.getHours();
    if (hours >= 9 && hours < 13) return "MORNING";
    if (hours >= 13 && hours < 17) return "AFTERNOON";
    if (hours >= 17 && hours < 21) return "EVENING";
    return null;
  };

  const currentSlotType = getCurrentSlotType();
  const getLiveActivities = () => {
    if (!data || !currentSlotType) return { current: null, next: null };

    const currentSlot = data.slots.find(s => s.slot_type === currentSlotType);
    if (!currentSlot || !currentSlot.blocks || currentSlot.blocks.length === 0) return { current: null, next: null };

    // Find first non-travel block as current
    const activities = currentSlot.blocks.filter(b => b.block_type !== 'TRAVEL');
    const current: ItineraryBlock | null = activities[0] || null;
    let next: ItineraryBlock | null = activities[1] || null;

    if (!next) {
      const slotsTypes: ("MORNING" | "AFTERNOON" | "EVENING")[] = ["MORNING", "AFTERNOON", "EVENING"];
      const currentIndex = slotsTypes.indexOf(currentSlotType as any);
      if (currentIndex < slotsTypes.length - 1) {
        const nextSlot = data.slots.find(s => s.slot_type === slotsTypes[currentIndex + 1]);
        next = nextSlot?.blocks?.find((b: ItineraryBlock) => b.block_type !== 'TRAVEL') || null;
      }
    }

    return { current, next };
  };

  const { current, next } = getLiveActivities();
  const currentSpot: ItineraryBlock | null = current;
  const nextSpot: ItineraryBlock | null = next;

  // Live Mode Time & Slot Update
  useEffect(() => {
    if (!isLiveMode) return;

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Notification Logic: Check if we need to leave soon
      checkNotifications(now);
    }, 60000);

    // Initial weather fetch
    const firstSpotBlock = data?.slots?.flatMap(s => s.blocks || []).find(b => b.block_type === 'SPOT' && b.latitude && b.longitude);
    if (firstSpotBlock) {
      tripService.getWeather(firstSpotBlock.latitude, firstSpotBlock.longitude).then(setWeather);
    }

    // Fetch advice for the current spot if it changed
    if (currentSpot && currentSpot.spot_id && currentSpot.spot_id !== lastAdvisedSpotId) {
      setIsGuideLoading(true);
      tripService.getGuideAdvice(currentSpot.spot_id)
        .then(data => {
          setGuideData(data);
          setLastAdvisedSpotId(currentSpot.spot_id!);
        })
        .finally(() => setIsGuideLoading(false));
    }

    return () => clearInterval(timer);
  }, [isLiveMode, data, currentSpot]);

  const isRunningLate = () => {
    if (!isLiveMode || !currentSpot || !currentSpot.endTime) return false;
    const [h, m] = currentSpot.endTime.split(':').map(Number);
    const endMinutes = h * 60 + m;
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return currentMinutes > (endMinutes + 15); // 15 min buffer before suggesting reschedule
  };

  const isLate = isRunningLate();

  const handleReschedule = async () => {
    try {
      const now = new Date();
      const startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (!data) return;
      await tripService.rescheduleFromNow(data.id, startTime);
      toast.success("Itinerary Rescheduled!", { description: "The rest of your day has been adjusted to your current time." });
      fetchDayData();
    } catch (err) {
      toast.error("Failed to reschedule.");
    }
  };

  const isRainy = weather?.condition?.toLowerCase().includes('rain') || weather?.condition?.toLowerCase().includes('storm');
  const isOutdoorSpot = (spot: any) => {
    const outdoorTypes = ['park', 'viewpoint', 'waterfall', 'trek', 'lake'];
    return outdoorTypes.includes(spot?.type?.toLowerCase() || '');
  };

  const showWeatherWarning = isRainy && (isOutdoorSpot(currentSpot) || isOutdoorSpot(nextSpot));

  const handleScanReceipt = async () => {
    const text = prompt("Simulate Receipt Scan: Paste text from receipt (e.g. 'Starbucks $15.50 Coffee')");
    if (!text) return;
    
    try {
      const data = await tripService.scanReceipt(text);
      await tripService.createExpense(resolvedParams.tripId, {
        title: data.title,
        amount: data.amount,
        category: data.category,
        merchant: data.merchant,
        currency: data.currency
      });
      toast.success("Expense Added!", { description: `${data.merchant}: ${data.currency} ${data.amount}` });
    } catch (err) {
      toast.error("Scan failed.");
    }
  };

  const isTripStarted = () => {
    if (!trip) return false;
    const start = new Date(trip.startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today >= start;
  };

  const canGoLive = isTripStarted();

  const handleRemoveBlock = async (blockId: string) => {
    try {
      await tripService.removeBlock(blockId);
      toast.success("Block removed!");
      fetchDayData();
    } catch (err: any) {
      toast.error("Failed to remove block.");
    }
  };

  const handleAddActivity = async (blockId: string, activityId: string) => {
    const slot = data?.slots.find(s => s.blocks.some(b => b.id === blockId));
    if (!slot) {
      toast.error("Invalid slot");
      return;
    }

    try {
      await tripService.addActivityToSlot(slot.id, activityId);
      fetchDayData();
    } catch (err) {
      console.error("Add activity error:", err);
      throw err; // Re-throw for SortableBlock to handle
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // --- CASE 1: Dragging a Gem from Suggestions ---
    if (active.data.current?.type === 'GEM') {
      const spot = active.data.current.spot;
      
      // Target could be a block or a slot-droppable (if we add one)
      // For now, let's find the slot ID from the 'over' ID
      const targetSlot = data?.slots.find(s => s.id === over.id || s.blocks.some(b => b.id === over.id));
      
      if (!targetSlot) {
        console.warn("Dropped gem over invalid target:", over.id);
        return;
      }

      try {
        toast.loading(`Adding ${spot.name} to ${targetSlot.slot_type}...`, { id: 'add-gem' });
        await tripService.addSpotToSlot(targetSlot.id, spot.id);
        toast.success(`Added ${spot.name}!`, { id: 'add-gem' });
        fetchDayData();
      } catch (err: any) {
        console.error("[DayView] handleDragEnd GEM drop EXCEPTION:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        toast.error(err.response?.data?.error || "Failed to add gem via drag.", { id: 'add-gem' });
        fetchDayData();
      }
      return;
    }

    // --- CASE 2: Reordering Existing Blocks ---
    if (active.id !== over.id) {
      // Find which slot the 'active' and 'over' blocks belong to
      const activeSlot = data?.slots.find(s => s.blocks.some(b => b.id === active.id));
      const overSlot = data?.slots.find(s => s.blocks.some(b => b.id === over.id));
      
      if (!activeSlot || !overSlot) return;

      const oldIndex = activeSlot.blocks.findIndex(b => b.id === active.id);
      const newIndex = overSlot.blocks.findIndex(b => b.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // Optimistic Update
      let newData = { ...data! };
      if (activeSlot.id === overSlot.id) {
        const newBlocks = arrayMove(activeSlot.blocks, oldIndex, newIndex);
        newData.slots = data!.slots.map(s => 
          s.id === activeSlot.id ? { ...s, blocks: newBlocks } : s
        );
      } else {
        const activeBlocks = [...activeSlot.blocks];
        const [movedBlock] = activeBlocks.splice(oldIndex, 1);
        const overBlocks = [...overSlot.blocks];
        overBlocks.splice(newIndex, 0, movedBlock);

        newData.slots = data!.slots.map(s => {
          if (s.id === activeSlot.id) return { ...s, blocks: activeBlocks };
          if (s.id === overSlot.id) return { ...s, blocks: overBlocks };
          return s;
        });
      }
      
      setData(newData);

      try {
        await tripService.reorderBlocks(active.id as string, newIndex + 1, overSlot.id);
        toast.success("Timeline updated!");
        fetchDayData();
      } catch (err: any) {
        toast.error("Failed to reorder blocks.");
        fetchDayData();
      }
    }
  };


  const checkNotifications = (now: Date) => {
    const targetSpot = nextSpot;
    if (!data || !targetSpot) return;

    // Notification Logic: If we need to leave soon for the next spot
    const currentEpoch = Math.floor(now.getTime() / 60000);

    // 1. Travel Alert (Already exists, but refined)
    const allBlocks = data?.slots?.flatMap(s => s.blocks || []) || [];
    const nextSpotIdx = allBlocks.findIndex(b => b.id === nextSpot?.id);
    const prevBlock = nextSpotIdx > 0 ? allBlocks[nextSpotIdx - 1] : null;
    const travelTime = (prevBlock && prevBlock.block_type === 'TRAVEL') ? prevBlock.travel_time_minutes : 0;

    if (travelTime && travelTime > 0 && currentEpoch - lastNotificationTime > 60) {
      // Check if we are within travelTime + 5 mins of the next spot's startTime
      const [h, m] = nextSpot!.startTime.split(':').map(Number);
      const nextStartTimeEpochMinutes = h * 60 + m;
      const currentDayMinutes = now.getHours() * 60 + now.getMinutes();
      
      if (nextStartTimeEpochMinutes - currentDayMinutes <= (travelTime + 5)) {
        toast("Travel Alert!", {
          description: `Time to head to ${nextSpot?.name}! It's a ${travelTime} min drive.`,
          icon: <MoveUpRight className="h-5 w-5 text-primary" />,
          action: {
            label: "Navigate",
            onClick: () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${nextSpot?.latitude},${nextSpot?.longitude}`, '_blank')
          }
        });
        setLastNotificationTime(currentEpoch);
      }
    }

    // 2. Arrival Alert: When arriving at a spot
    if (currentSpot && currentEpoch - lastNotificationTime > 120) {
        toast(`Welcome to ${currentSpot.name}!`, {
            description: "Your virtual guide has some fresh tips for you below.",
            icon: <Sparkles className="h-5 w-5 text-primary" />,
        });
        setLastNotificationTime(currentEpoch);
    }
  };


  const isLive = trip?.status === 'ONGOING';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-500 font-bold animate-pulse">Consulting the Oracle...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Itinerary Missing</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">{error || "We couldn't find the data for this day."}</p>
        <Link href={`/dashboard/trips/${resolvedParams.tripId}`}>
          <Button variant="outline" className="rounded-xl px-8 font-bold">Back to Trip Overview</Button>
        </Link>
      </div>
    );
  }

  // Flattened spots for map
  const allSpots = data.slots.flatMap(s => (s.blocks || []).filter(b => b.block_type === 'SPOT'));
  const mapLocations: MapLocation[] = allSpots.map((spot) => ({
    id: spot.spot_id!,
    name: spot.name,
    lat: spot.latitude,
    lng: spot.longitude
  }));

  const slotIcons = {
    MORNING: <Coffee className="h-6 w-6 text-orange-400" />,
    AFTERNOON: <Utensils className="h-6 w-6 text-primary" />,
    EVENING: <Star className="h-6 w-6 text-indigo-400" />
  };

  const slotTitles = {
    MORNING: "Morning Exploration",
    AFTERNOON: "Afternoon Discoveries",
    EVENING: "Evening Serenity"
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32">
      <div className="fixed inset-0 z-0 opacity-[0.3] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)", backgroundSize: "40px 40px" }}
      />

      <Section className="py-12 relative z-10">
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-[2rem] border-2 border-amber-500/20 bg-amber-50/50 backdrop-blur-md flex items-center gap-4 shadow-xl shadow-amber-500/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              {isTripPassed() ? <History className="h-24 w-24 text-amber-600" /> : <Clock className="h-24 w-24 text-amber-600" />}
            </div>
            <div className="bg-amber-500/10 h-14 w-14 rounded-2xl flex items-center justify-center border border-amber-500/20 shrink-0">
              {isTripPassed() ? <History className="h-7 w-7 text-amber-600 animate-pulse" /> : <Clock className="h-7 w-7 text-amber-600 animate-pulse" />}
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 leading-tight">
                {isTripPassed() ? "Done & Dusted! 🎒" : "Past Day Locked 🔒"}
              </h4>
              <p className="text-slate-500 text-sm font-medium mt-1">
                {isTripPassed() 
                  ? "This trip is completed and cannot be modified. Relive the memories!" 
                  : "This day's timeline has passed and cannot be modified."}
              </p>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href={`/dashboard/trips/${resolvedParams.tripId}`}
              className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-all group mb-8 bg-white px-6 py-2.5 rounded-full border border-slate-200 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Overview
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-black">
                DAY {data.day_number}
              </Badge>
              <span className="text-slate-400 font-bold">•</span>
              <span className="text-slate-500 font-bold">{new Date(data.date).toLocaleDateString()}</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black font-heading tracking-tighter italic leading-tight text-slate-900 mb-6">
              Ultimate <span className="text-primary italic">Travel</span> Timeline
            </h1>
            <p className="text-slate-500 text-xl max-w-2xl leading-relaxed font-medium">
              Your day has been optimized for the best experience. Follow the timeline for a seamless journey.
            </p>
          </motion.div>

          {/* ... Action buttons omitted for brevity, same as before ... */}
          {/* Action buttons */}
          <div className="flex gap-4 w-full md:w-auto">
            {!isLocked && (
              <Link
                href={`/dashboard/trips/${resolvedParams.tripId}/days/${resolvedParams.day}/edit`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-2xl font-black h-16 px-10 border-2 text-lg bg-white shadow-xl shadow-slate-200/50"
                )}
              >
                Edit Itinerary
              </Link>
            )}

            {!isLocked && trip && ['DRAFT', 'PLANNED', 'UPCOMING'].includes(trip.status.toUpperCase()) && (
              <Button
                onClick={async () => {
                  try {
                    await tripService.updateTripStatus(resolvedParams.tripId, 'CONFIRMED');
                    toast.success("Itinerary confirmed successfully!", {
                      description: "Your adventure is locked in!"
                    });
                    setTrip({ ...trip, status: 'CONFIRMED' });
                    fetchDayData();
                  } catch (err: any) {
                    toast.error(err.response?.data?.error || err.message || "Failed to confirm itinerary.");
                  }
                }}
                className="rounded-2xl font-black h-16 px-10 text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/30 gap-2 border border-emerald-500/20"
              >
                <CheckCircle2 className="h-6 w-6" />
                Confirm Itinerary
              </Button>
            )}

            <Link
              href={`/dashboard/trips/${resolvedParams.tripId}`}
              className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl font-black h-16 px-10 border-2 flex-1 md:flex-none text-lg bg-white shadow-xl shadow-slate-200/50")}
            >
              Trip View
            </Link>
          </div>
        </div>

        {/* Live Dashboard Overlay */}
        {isLiveMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mb-16 bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Activity className="h-48 w-48 text-white" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
              <div className="lg:col-span-1 space-y-2 border-r border-white/10 pr-8">
                <div className="flex items-center gap-2 text-primary">
                  <Zap className="h-4 w-4 fill-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Live Status</span>
                </div>
                <h2 className="text-4xl font-black text-white italic">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-tighter">Current Slot: <span className="text-white">{currentSlotType || "OUTSIDE HOURS"}</span></p>
              </div>

              <div className="lg:col-span-2 flex items-center gap-8">
                <div className="flex-1">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Current Spot</p>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-800 border border-white/10">
                      {currentSpot ? (
                        <img src={currentSpot.image} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-yellow-500" /></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white leading-none mb-2 mt-1">
                        {currentSpot ? currentSpot.name : "Free Exploration"}
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Timer className="h-3 w-3 text-primary" />
                          <span className="text-[10px] font-bold text-white/60 tracking-tight">Active Now</span>
                        </div>
                        {nextSpot && (
                          <div className="flex items-center gap-1.5">
                            <Car className="h-3 w-3 text-orange-400" />
                            <span className="text-[10px] font-bold text-white/60 tracking-tight">Next: {nextSpot.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-12 w-[1px] bg-white/10 mx-4 hidden lg:block" />

                <div className="hidden md:block">
                  <div className="flex items-center gap-3">
                    {weather ? (
                      <>
                        <div className="bg-white/5 h-12 w-12 rounded-2xl flex items-center justify-center border border-white/10">
                          {weather.condition === 'Sunny' ? <Sun className="h-6 w-6 text-yellow-400" /> : <CloudRain className="h-6 w-6 text-blue-400" />}
                        </div>
                        <div>
                          <p className="text-white font-black text-lg leading-none">{weather.temp}°C</p>
                          <p className="text-white/40 text-[10px] font-black uppercase">{weather.condition}</p>
                        </div>
                      </>
                    ) : (
                      <Loader2 className="h-6 w-6 animate-spin text-white/20" />
                    )}
                  </div>
                </div>
              </div>

                <div className="lg:col-span-1 border-l border-white/10 pl-8 flex flex-col justify-center gap-3">
                  {isLate && !isLocked ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-2"
                    >
                      <Button
                        onClick={handleReschedule}
                        className="w-full rounded-2xl h-12 bg-red-500 text-white font-black hover:bg-red-600 gap-2 shadow-lg shadow-red-500/20"
                      >
                        <History className="h-4 w-4" />
                        Reschedule Day
                      </Button>
                      <p className="text-[9px] font-bold text-red-400 text-center uppercase tracking-widest animate-pulse">Running Late!</p>
                    </motion.div>
                  ) : (
                    <Button
                      onClick={() => {
                        if (nextSpot) {
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${nextSpot.latitude},${nextSpot.longitude}`, '_blank');
                        }
                      }}
                      disabled={!nextSpot}
                      className="w-full rounded-2xl h-12 bg-white text-black font-black hover:bg-slate-100 gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      Navigate Next
                    </Button>
                  )}
                  <p className="text-center text-white/30 text-[9px] font-bold tracking-tight">Smart notifications active.</p>
                </div>
              </div>

              {/* Weather Alert Banner */}
              {showWeatherWarning && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Umbrella className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-black uppercase tracking-widest">Weather Alert</p>
                      <p className="text-white/60 text-[11px] font-medium">It's raining! Consider swapping your outdoor visits for indoor museums.</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 text-[10px] font-black uppercase">
                    Find Indoors
                  </Button>
                </motion.div>
              )}
            
              {/* Virtual Guide Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 pt-8 border-t border-white/10"
            >
              <div className="flex items-start gap-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-primary fill-primary/20" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white font-black uppercase text-[10px] tracking-[0.2em]">Virtual Guide Advice</span>
                    {isGuideLoading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0 0 0 0px rgba(245, 158, 11, 0.5)",
                          "0 0 0 6px rgba(245, 158, 11, 0)",
                          "0 0 0 0px rgba(245, 158, 11, 0)"
                        ]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2, 
                        ease: "easeInOut" 
                      }}
                      className="rounded-full ml-2 flex items-center justify-center"
                    >
                      <Button 
                        onClick={() => setIsChatOpen(true)}
                        size="sm"
                        className="h-6 rounded-full px-3 text-[9px] font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black gap-1 transition-all border-none shadow-none cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5 fill-black/20 animate-pulse" />
                        Ask Doubt
                      </Button>
                    </motion.div>
                  </div>
                  {guideData ? (
                    <div className="space-y-4">
                      <motion.p 
                        key={guideData.advice}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/80 text-sm leading-relaxed italic font-medium max-w-3xl"
                      >
                        "{guideData.advice}"
                      </motion.p>
                      
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 w-fit"
                      >
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Pack: {guideData.packingTip}</span>
                      </motion.div>
                    </div>
                  ) : (
                    <p className="text-white/30 text-sm italic">
                      {isGuideLoading ? "Guide is thinking..." : "Your guide is watching your progress. Reach the next spot for more tips!"}
                    </p>
                  )}
                </div>
                <div className="hidden md:flex gap-2">
                   <Button 
                    onClick={handleScanReceipt}
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl text-white/40 hover:text-white hover:bg-white/10 group relative"
                   >
                      <Receipt className="h-5 w-5" />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Scan Receipt</span>
                   </Button>
                   <Button variant="ghost" size="icon" className="rounded-xl text-white/40 hover:text-white hover:bg-white/10">
                      <Info className="h-5 w-5" />
                   </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-16">
            <h2 className="text-3xl font-black font-heading tracking-tight flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              Slot Breakdown
            </h2>

            {data.day_number === 1 && (
              trip?.startDetails ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <Card className="border-none shadow-xl shadow-primary/5 bg-gradient-to-br from-primary/5 to-transparent rounded-[2.5rem] overflow-hidden group border border-primary/10">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-6">
                          <div className="h-20 w-20 rounded-3xl bg-white shadow-2xl shadow-primary/10 flex items-center justify-center border border-primary/5 group-hover:scale-110 transition-transform duration-500">
                            {trip.startDetails.mode === 'flight' && <Plane className="h-10 w-10 text-primary" />}
                            {trip.startDetails.mode === 'train' && <TrainFront className="h-10 w-10 text-primary" />}
                            {trip.startDetails.mode === 'bus' && <Bus className="h-10 w-10 text-primary" />}
                            {trip.startDetails.mode === 'car' && <Car className="h-10 w-10 text-primary" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-primary font-black uppercase text-xs tracking-widest flex items-center gap-2">
                                {trip.startDetails.mode === 'flight' && <Plane className="h-4 w-4" />}
                                {trip.startDetails.mode === 'train' && <TrainFront className="h-4 w-4" />}
                                {trip.startDetails.mode === 'bus' && <Bus className="h-4 w-4" />}
                                {trip.startDetails.mode === 'car' && <Car className="h-4 w-4" />}
                                Arrival
                              </span>
                            </div>
                            <h3 className="text-3xl font-black font-heading tracking-tight italic">
                              {trip.startDetails.fromLocation} <span className="text-slate-300 not-italic mx-2">→</span> {trip.startDetails.toLocation}
                            </h3>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="flex items-center gap-1.5 text-slate-500 font-bold text-sm">
                                <Clock className="h-4 w-4 text-primary/50" />
                                Arrives at {new Date(trip.startDetails.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                              </span>
                            </div>
                            {['flight', 'train', 'bus'].includes(trip.startDetails.mode) && (
                              <div className="mt-4 flex items-center gap-2 text-slate-400 group-hover:text-primary/70 transition-colors">
                                <Info className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Manage your arrival journey</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button 
                          onClick={() => setIsStartDetailsModalOpen(true)}
                          disabled={isLocked}
                          className="rounded-2xl h-14 px-8 font-black gap-2 bg-white text-primary border-2 border-primary/10 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-xl shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Edit Travel Details
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-2 border-dashed border-slate-200 bg-white rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all duration-500">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <Plane className="h-7 w-7" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black italic mb-1">Add how you're reaching this trip</h3>
                            <p className="text-slate-400 font-bold text-sm leading-none">Your timeline is more accurate with travel details.</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setIsStartDetailsModalOpen(true)}
                          disabled={isLocked}
                          className="rounded-2xl h-14 px-10 font-black gap-2 bg-primary text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Travel Details
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            )}

            <div className="space-y-20">
              <DndContext
                sensors={isLocked ? [] : sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={allBlocks.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {data.slots.filter(s => s.isActive !== false).map((slot, slotIdx) => (
                    <DroppableSlot key={slot.id} id={slot.id} className={cn(
                      "relative transition-all duration-500",
                      isLiveMode && currentSlotType === slot.slot_type ? "opacity-100 scale-[1.02]" : isLiveMode ? "opacity-40 grayscale-[0.5]" : ""
                    )}>
                      <div className="flex items-center gap-6 mb-10">
                        <div className={cn(
                          "h-14 w-14 rounded-3xl bg-white shadow-xl flex items-center justify-center border border-slate-100 scale-110 transition-all",
                          isLiveMode && currentSlotType === slot.slot_type ? "border-primary ring-4 ring-primary/10" : ""
                        )}>
                          {slotIcons[slot.slot_type]}
                        </div>
                        <div>
                          <h3 className={cn(
                            "text-2xl font-black font-heading tracking-tight",
                            isLiveMode && currentSlotType === slot.slot_type ? "text-primary" : ""
                          )}>{slotTitles[slot.slot_type]}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-primary tracking-widest uppercase">{slot.start_time} — {slot.end_time}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span className="text-xs font-bold text-slate-400">{(slot.blocks || []).length} Segments Planned</span>
                            {isLiveMode && currentSlotType === slot.slot_type && (
                              <Badge className="ml-2 bg-primary text-white animate-pulse">ACTIVE NOW</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6 pl-8 border-l-2 border-slate-100 ml-7">
                        {(slot.blocks || []).map((block) => (
                          <SortableBlock 
                            key={block.id} 
                            block={block} 
                            tripId={resolvedParams.tripId} 
                            dayNumber={resolvedParams.day}
                            isEditing={isEditing}
                            isLocked={isLocked}
                            onRemove={handleRemoveBlock}
                            onAddActivity={handleAddActivity}
                          />
                        ))}
                        

                      </div>
                    </DroppableSlot>
                  ))}
                </SortableContext>
              </DndContext>

              {data.day_number === (trip?.tripDays?.length || 0) && (
                trip?.endDetails ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mt-16"
                  >
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <Card className="border-none shadow-xl shadow-primary/5 bg-gradient-to-br from-primary/5 to-transparent rounded-[2.5rem] overflow-hidden group border border-primary/10">
                      <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                          <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-3xl bg-white shadow-2xl shadow-primary/10 flex items-center justify-center border border-primary/5 group-hover:scale-110 transition-transform duration-500">
                              {trip.endDetails.mode === 'flight' && <Plane className="h-10 w-10 text-primary" />}
                              {trip.endDetails.mode === 'train' && <TrainFront className="h-10 w-10 text-primary" />}
                              {trip.endDetails.mode === 'bus' && <Bus className="h-10 w-10 text-primary" />}
                              {trip.endDetails.mode === 'car' && <Car className="h-10 w-10 text-primary" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-primary font-black uppercase text-xs tracking-widest flex items-center gap-2">
                                  {trip.endDetails.mode === 'flight' && <Plane className="h-4 w-4" />}
                                  {trip.endDetails.mode === 'train' && <TrainFront className="h-4 w-4" />}
                                  {trip.endDetails.mode === 'bus' && <Bus className="h-4 w-4" />}
                                  {trip.endDetails.mode === 'car' && <Car className="h-4 w-4" />}
                                  Return Journey
                                </span>
                              </div>
                              <h3 className="text-3xl font-black font-heading tracking-tight italic">
                                {trip.endDetails.fromLocation} <span className="text-slate-300 not-italic mx-2">→</span> {trip.endDetails.toLocation}
                              </h3>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="flex items-center gap-1.5 text-slate-500 font-bold text-sm">
                                  <Clock className="h-4 w-4 text-primary/50" />
                                  Departs at {new Date(trip.endDetails.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            onClick={() => setIsReturnDetailsModalOpen(true)}
                            disabled={isLocked}
                            className="rounded-2xl h-14 px-8 font-black gap-2 bg-white text-primary border-2 border-primary/10 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-xl shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Edit Return Details
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-16"
                  >
                    <Card className="border-2 border-dashed border-slate-200 bg-white rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all duration-500">
                      <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                          <div className="flex items-center gap-6">
                            <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                              <Plane className="h-7 w-7" />
                            </div>
                            <div>
                              <h3 className="text-xl font-black italic mb-1">Add your return journey</h3>
                              <p className="text-slate-400 font-bold text-sm leading-none">Complete your trip plan with return logistics.</p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => setIsReturnDetailsModalOpen(true)}
                            disabled={isLocked}
                            className="rounded-2xl h-14 px-10 font-black gap-2 bg-primary text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add Return Details
                            <Plus className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              )}
            </div>
          </div>

          <div className="lg:col-span-4 sticky top-12 space-y-8">
            <Card className="border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] bg-white p-8">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-black font-heading flex items-center gap-3">
                  <MapPin className="h-7 w-7 text-primary" />
                  Route Preview
                </CardTitle>
                <CardDescription className="text-slate-400 font-bold">Visualizing your route through the city.</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pt-4">
                <div className="h-72 rounded-[2rem] bg-slate-100 relative overflow-hidden group mb-8">
                  <MapRoute locations={mapLocations} className="absolute inset-0 w-full h-full" />

                  <div className="absolute inset-4 flex flex-col justify-between pointer-events-none z-10">
                    <div className="flex justify-end">
                      <div className="bg-white/90 backdrop-blur-md rounded-2xl px-3 py-2 border border-white flex items-center gap-2 shadow-xl">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Live Traffic: Balanced</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Car className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Travel Mode</p>
                      <p className="text-lg font-black italic">Private Vehicle</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <Navigation className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Nav Status</p>
                      <p className="text-lg font-black italic">Active Route</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl shadow-primary/20 relative overflow-hidden"
            >
              <Star className="absolute -top-4 -right-4 h-32 w-32 text-white/10 rotate-12" />
              <div className="relative z-10">
                <div className="p-3 bg-white/20 rounded-xl w-fit mb-4 backdrop-blur-md border border-white/20">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-black italic font-heading mb-2 leading-tight">Traveler's Tip</h4>
                <p className="text-white/80 font-medium text-sm leading-relaxed">
                  Always keep a power bank handy. Public transport in this area is frequent but traffic can be unpredictable in the evenings.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      <StartDetailsModal
        isOpen={isStartDetailsModalOpen}
        onClose={() => setIsStartDetailsModalOpen(false)}
        tripId={resolvedParams.tripId}
        initialData={trip?.startDetails}
        onSuccess={fetchDayData}
      />

      <ReturnDetailsModal
        isOpen={isReturnDetailsModalOpen}
        onClose={() => setIsReturnDetailsModalOpen(false)}
        tripId={trip?.id || ""}
        initialData={trip?.endDetails}
        onSuccess={fetchDayData}
      />

      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-transparent border-none shadow-none">
          {trip && (
            <ItemChatSection 
              itemId={trip.id} 
              itemType="trip" 
              itemName={trip.title} 
              theme="light" 
              suggestions={[
                `Can you summarize Day ${resolvedParams.day} in detail?`,
                "What should I pack for this day?",
                "Is there any weather warning or travel advice for today?",
                "Recommend places to eat near my scheduled spots today."
              ]}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
