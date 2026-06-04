"use client";

import { useState, use, useEffect, useCallback } from "react";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  GripVertical, 
  ChevronRight, 
  MapPin,
  Clock,
  Search,
  Save,
  Loader2,
  X,
  Sparkles,
  Sunrise,
  Sun,
  Sunset
} from "lucide-react";
import Link from "next/link";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { itineraryService, TripDayItinerary, ItineraryItem } from "@/services/itinerary.service";
import destinationService, { TravelSpot } from "@/services/destinationService";
import { tripService, Trip } from "@/services/trip.service";

interface DayState {
  morning: ItineraryItem[];
  afternoon: ItineraryItem[];
  evening: ItineraryItem[];
}

export default function ItineraryBuilderPage({ params }: { params: Promise<{ tripId: string }> }) {
  const resolvedParams = use(params);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [allDays, setAllDays] = useState<TripDayItinerary[]>([]);
  const [currentDayIdx, setCurrentDayIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<keyof DayState>("morning");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableSpots, setAvailableSpots] = useState<TravelSpot[]>([]);
  const [searching, setSearching] = useState(false);

  const organizeSpots = (items: ItineraryItem[]): DayState => {
    const morning: ItineraryItem[] = [];
    const afternoon: ItineraryItem[] = [];
    const evening: ItineraryItem[] = [];

    items.forEach(item => {
      if (!item.startTime) return;
      const hour = parseInt(item.startTime.split(':')[0]);
      if (hour < 12) morning.push(item);
      else if (hour < 17) afternoon.push(item);
      else evening.push(item);
    });

    const sortByOrder = (a: ItineraryItem, b: ItineraryItem) => a.orderIndex - b.orderIndex;
    
    return {
      morning: morning.sort(sortByOrder),
      afternoon: afternoon.sort(sortByOrder),
      evening: evening.sort(sortByOrder)
    };
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tripDetails, itineraryData] = await Promise.all([
        tripService.getTrip(resolvedParams.tripId),
        itineraryService.getTripItinerary(resolvedParams.tripId)
      ]);

      setTrip(tripDetails);
      setAllDays(itineraryData || []);
      
      // Load available spots for this destination
      if (tripDetails?.destination?.id) {
        const { spots } = await destinationService.getDestinationWithSpots(tripDetails.destination.id);
        setAvailableSpots(spots || []);
      }
    } catch (error) {
      console.error("Failed to load itinerary data:", error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.tripId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemove = async (itemId: string) => {
    try {
      setIsSaving(true);
      await itineraryService.removeSpot(itemId);
      const updatedItinerary = await itineraryService.getTripItinerary(resolvedParams.tripId);
      setAllDays(updatedItinerary);
    } catch (error) {
      console.error("Failed to remove spot:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReorder = async (slot: keyof DayState, newOrder: ItineraryItem[]) => {
    // Update local state first
    const updatedDays = [...(allDays || [])];
    if (updatedDays.length <= currentDayIdx) return;
    const currentDay = updatedDays[currentDayIdx];
    if (!currentDay) return;
    
    // Find items that AREN'T in this slot
    const otherItems = currentDay.itineraryItems.filter(item => {
      const hour = parseInt(item.startTime?.split(':')[0] || "0");
      if (slot === "morning") return hour >= 12;
      if (slot === "afternoon") return hour < 12 || hour >= 17;
      if (slot === "evening") return hour < 17;
      return true;
    });

    currentDay.itineraryItems = [...otherItems, ...newOrder];
    setAllDays(updatedDays);
    
    try {
      const updates = newOrder.map((item, idx) => ({
        id: item.id,
        orderIndex: idx + 1
      }));
      await itineraryService.reorderSpots(allDays[currentDayIdx].id, updates);
    } catch (error) {
      console.error("Failed to reorder:", error);
    }
  };

  const handleAddSpot = async (spot: TravelSpot) => {
    const startTimeMap: Record<keyof DayState, string> = {
      morning: "09:00",
      afternoon: "14:00",
      evening: "19:00"
    };

    try {
      setIsSaving(true);
      await itineraryService.addSpot({
        tripDayId: allDays[currentDayIdx].id,
        travelSpotId: spot.id,
        startTime: startTimeMap[selectedSlot],
        endTime: "21:00",
        notes: `Exploring ${spot.name}`
      });

      const updatedItinerary = await itineraryService.getTripItinerary(resolvedParams.tripId);
      setAllDays(updatedItinerary);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add spot:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const currentDay = allDays[currentDayIdx];
  const organizedItems = currentDay ? organizeSpots(currentDay.itineraryItems) : { morning: [], afternoon: [], evening: [] };
  const filteredSpots = availableSpots.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-slate-50">
         <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
     );
  }

  const BuilderSection = ({ 
    title, 
    icon: Icon, 
    colorClass, 
    section, 
    items 
  }: { 
    title: string, 
    icon: any, 
    colorClass: string, 
    section: keyof DayState, 
    items: ItineraryItem[] 
  }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 min-w-[320px] flex flex-col h-full bg-white/60 backdrop-blur-2xl rounded-[3rem] p-8 border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative group overflow-hidden"
    >
      <div className={cn("absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[100px] opacity-10 transition-all duration-1000 group-hover:opacity-20", colorClass.split(' ')[1])} />
      
      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className={cn("p-4 rounded-[1.25rem] shadow-xl shadow-current/5 border border-white/40", colorClass)}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black font-heading tracking-tight text-slate-900">{title}</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
              {items.length} {items.length === 1 ? 'Stop' : 'Stops'}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => {
            setSelectedSlot(section);
            setIsModalOpen(true);
          }}
          className="rounded-2xl border-slate-200 bg-white hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 h-10 w-10 shadow-sm"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      <Reorder.Group 
        axis="y" 
        values={items} 
        onReorder={(newOrder) => handleReorder(section, newOrder)}
        className="space-y-4 flex-1 relative z-10"
      >
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <Reorder.Item 
              key={item.id} 
              value={item}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              whileDrag={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}
              className="relative"
            >
              <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 group transition-all duration-300 overflow-visible bg-white/80 backdrop-blur-sm rounded-[1.5rem]">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-primary transition-colors h-10 w-6 flex items-center justify-center">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                       <MapPin className="h-3 w-3 text-primary/40" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.travelSpot ? 'Travel Spot' : 'Personal Activity'}</span>
                    </div>
                    <span className="font-bold text-lg text-slate-800">
                        {item.travelSpot?.name || item.notes || "Unnamed Stop"}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 italic">{item.startTime} - {item.endTime}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemove(item.id)}
                    className="h-10 w-10 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-destructive hover:bg-destructive/5 transition-all rounded-xl"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </Reorder.Item>
          ))}
        </AnimatePresence>
        
        {items.length === 0 && (
          <div className="h-44 border-[3px] border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 group hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-700">
            <Sparkles className="h-10 w-10 mb-4 opacity-10 group-hover:scale-110 transition-transform group-hover:text-primary group-hover:opacity-40" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Open Canvas</span>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => {
                setSelectedSlot(section);
                setIsModalOpen(true);
              }}
              className="text-[10px] font-black mt-2 text-primary/40 hover:text-primary decoration-2 h-auto p-0"
            >
              ADD A DESTINATION
            </Button>
          </div>
        )}
      </Reorder.Group>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-48 overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-[150px]" />
        <div 
           className="absolute inset-0 opacity-[0.4]" 
           style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)", backgroundSize: "32px 32px" }}
        />
      </div>

      <Section className="py-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              href={`/dashboard/trips/${resolvedParams.tripId}`} 
              className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-all group mb-8 bg-white px-6 py-2.5 rounded-full border border-slate-200 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Return to Overview
            </Link>
            <h1 className="text-6xl sm:text-8xl font-black font-heading tracking-tighter italic leading-none mb-6 text-slate-900">
               Architect <span className="text-primary drop-shadow-sm italic">Flow</span>
            </h1>
            <p className="text-slate-500 text-xl max-w-2xl leading-relaxed font-medium">
               Designing {trip?.title} in {trip?.destination.name}.
            </p>
          </motion.div>
          
          <div className="flex flex-col gap-4">
             <div className="flex bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white">
               {Array.isArray(allDays) && allDays.map((day, idx) => (
                 <button
                   key={day.id}
                   onClick={() => setCurrentDayIdx(idx)}
                   className={cn(
                     "px-6 py-2 rounded-xl text-sm font-black transition-all",
                     currentDayIdx === idx 
                        ? "bg-primary text-white shadow-lg" 
                        : "text-slate-400 hover:text-slate-600"
                   )}
                 >
                   DAY {day.dayNumber}
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-stretch min-h-[650px]">
          <BuilderSection 
            title="Morning" 
            icon={Sunrise} 
            colorClass="bg-amber-50 text-amber-600 border-amber-200/50"
            section="morning"
            items={organizedItems.morning}
          />
          <BuilderSection 
            title="Afternoon" 
            icon={Sun} 
            colorClass="bg-blue-50 text-blue-600 border-blue-200/50"
            section="afternoon"
            items={organizedItems.afternoon}
          />
          <BuilderSection 
            title="Evening" 
            icon={Sunset} 
            colorClass="bg-indigo-50 text-indigo-600 border-indigo-200/50"
            section="evening"
            items={organizedItems.evening}
          />
        </div>
      </Section>

      {/* Spot Picker Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div>
                   <h2 className="text-3xl font-black font-heading italic text-slate-900">Add Travel Spot</h2>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Select a destination for your {selectedSlot} slot</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full h-12 w-12 hover:bg-white transition-colors">
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="p-8 space-y-6">
                 <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                       type="text"
                       placeholder="Search spots..."
                       className="w-full h-16 pl-14 pr-8 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary transition-all text-lg"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 
                 <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredSpots.map(spot => (
                       <button
                          key={spot.id}
                          onClick={() => handleAddSpot(spot)}
                          className="group flex items-center gap-6 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left"
                       >
                          <div className="h-20 w-20 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform shrink-0">
                             <img src={spot.imageUrl || "https://images.unsplash.com/photo-1596422846543-75c6fc18a593?w=200&q=80"} className="w-full h-full object-cover" alt={spot.name} />
                          </div>
                          <div className="flex-1">
                             <h4 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                {spot.name}
                                <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
                             </h4>
                             <p className="text-sm text-slate-400 font-medium line-clamp-1 mt-1">{spot.description}</p>
                          </div>
                       </button>
                    ))}
                    {filteredSpots.length === 0 && (
                       <div className="py-20 text-center text-slate-400">
                          <X className="h-10 w-10 mx-auto mb-4 opacity-10" />
                          <p className="font-bold italic">No spots matching your search.</p>
                       </div>
                    )}
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
