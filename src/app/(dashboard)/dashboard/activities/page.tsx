"use client";

import { useEffect, useState } from "react";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Clock, 
  BarChart, 
  Wallet, 
  Calendar,
  CheckCircle2,
  Users,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  MapPin,
  ChevronDown,
  Info,
  ArrowUpDown,
  Star
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { activityService, Activity } from "@/services/activity.service";
import { bookingService, Booking } from "@/services/booking.service";
import { destinationService, Destination } from "@/services/destinationService";
import { cartService } from "@/services/cart.service";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ActivitiesPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Core data states
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [spotsMap, setSpotsMap] = useState<Record<string, Array<{ id: string; name: string }>>>({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedSpot, setSelectedSpot] = useState("");
  const [activeSort, setActiveSort] = useState("recommended"); // recommended, priceAsc, priceDesc, durationAsc, difficulty

  // Booking Modal states
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [numberOfPersons, setNumberOfPersons] = useState(1);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [actsRes, bookingsRes, destsRes] = await Promise.all([
          activityService.getActivities(),
          bookingService.getUserBookings(),
          destinationService.getDestinations()
        ]);
        setActivities(actsRes);
        setUserBookings(bookingsRes.bookings || []);
        setDestinations(destsRes);
      } catch (err: any) {
        setError(err.message || "Failed to load activities");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch spots when destination selection changes
  useEffect(() => {
    if (!selectedDestination) {
      setSelectedSpot("");
      return;
    }

    const fetchDestinationSpots = async () => {
      try {
        // Fetch destination details including associated spots
        const detail = await destinationService.getDestinationWithSpots(selectedDestination);
        setSpotsMap(prev => ({
          ...prev,
          [selectedDestination]: detail.spots.map(s => ({ id: s.id, name: s.name }))
        }));
        setSelectedSpot(""); // Reset selected spot when destination changes
      } catch (err) {
        console.error("Failed to load spots for destination:", err);
      }
    };

    if (!spotsMap[selectedDestination]) {
      fetchDestinationSpots();
    } else {
      setSelectedSpot("");
    }
  }, [selectedDestination]);

  // Cart logic
  const handleAddToCart = async () => {
    if (!selectedActivity) return;
    setIsBooking(true);
    
    try {
      await cartService.addToCart({
        type: 'ACTIVITY',
        activityId: selectedActivity.id,
        numberOfPersons: numberOfPersons,
        price: selectedActivity.pricePerPerson * numberOfPersons,
      });

      toast.success(`${selectedActivity.title} added to cart!`);
      setSelectedActivity(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add to cart.");
    } finally {
      setIsBooking(false);
    }
  };

  const isBooked = (activityId: string) => {
    return userBookings.some(
      b => b.activityId === activityId && 
      !['CANCELLED', 'REFUNDED', 'REJECTED', 'EXPIRED', 'REFUND_PROCESSING', 'REFUND_FAILED'].includes(b.status)
    );
  };

  // Get spots available for active selection dropdown
  const currentSpots = selectedDestination ? (spotsMap[selectedDestination] || []) : [];

  // Filter & Sort Logic
  const filteredActivities = activities.filter(activity => {
    // 1. Search Query filter (matches title, description, or spot name)
    const matchesSearch = searchQuery.trim() === "" || 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.travelSpot?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Destination filter
    // Note: Since destination info isn't directly resolved on the Activity object from backend,
    // we can filter using the spots loaded for that destination.
    let matchesDestination = true;
    if (selectedDestination) {
      const destSpots = spotsMap[selectedDestination] || [];
      const destSpotIds = destSpots.map(s => s.id);
      matchesDestination = activity.travelSpot ? destSpotIds.includes(activity.travelSpot.id) : false;
    }

    // 3. Spot filter
    const matchesSpot = !selectedSpot || (activity.travelSpot && activity.travelSpot.id === selectedSpot);

    return matchesSearch && matchesDestination && matchesSpot;
  }).sort((a, b) => {
    // 4. Sort calculations
    if (activeSort === "priceAsc") {
      return a.pricePerPerson - b.pricePerPerson;
    }
    if (activeSort === "priceDesc") {
      return b.pricePerPerson - a.pricePerPerson;
    }
    if (activeSort === "durationAsc") {
      return (a.durationMinutes || 0) - (b.durationMinutes || 0);
    }
    if (activeSort === "difficulty") {
      const levelVal = (diff?: string) => {
        if (diff === "Easy") return 1;
        if (diff === "Moderate") return 2;
        return 3;
      };
      return levelVal(a.difficulty) - levelVal(b.difficulty);
    }
    // "recommended" (Default fallback)
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 sm:p-12 text-slate-900">
      
      {/* Header Area */}
      <div className="max-w-7xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1.5 w-8 bg-amber-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Curated Quests</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black font-heading tracking-tighter italic text-slate-900 leading-none">
              Explore your <span className="text-amber-500">Adventures.</span>
            </h1>
            <p className="text-slate-500 text-sm font-bold mt-2 uppercase tracking-wide">Elite guide-assisted quests customized for your itinerary</p>
          </div>
        </motion.div>
      </div>

      {/* Advanced Visual Filter controls Panel */}
      <div className="max-w-7xl mx-auto mb-10 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/50 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Magnifying Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search adventures, guides..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 w-full pl-12 pr-6 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Destination Selector Dropdown */}
          <div className="lg:col-span-3 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="h-14 w-full pl-12 pr-10 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
            >
              <option value="">All Destinations</option>
              {destinations.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Spot Selector Dropdown (Sub-filter) */}
          <div className="lg:col-span-3 relative">
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-sky-400" />
            <select
              value={selectedSpot}
              onChange={(e) => setSelectedSpot(e.target.value)}
              disabled={!selectedDestination}
              className={cn(
                "h-14 w-full pl-12 pr-10 rounded-2xl border text-sm font-bold appearance-none focus:outline-none transition-all cursor-pointer",
                selectedDestination 
                  ? "bg-slate-50 border-slate-200 text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" 
                  : "bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              <option value="">{selectedDestination ? "All Travel Spots" : "Select Destination First"}</option>
              {currentSpots.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort Selector Dropdown */}
          <div className="lg:col-span-2 relative">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="h-14 w-full pl-12 pr-10 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="durationAsc">Duration</option>
              <option value="difficulty">Difficulty Level</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Info stats bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div>
            Showing <span className="text-amber-500">{filteredActivities.length}</span> of {activities.length} adventures
          </div>
          {(selectedDestination || selectedSpot || searchQuery) && (
            <button 
              onClick={() => {
                setSearchQuery("");
                setSelectedDestination("");
                setSelectedSpot("");
                setActiveSort("recommended");
              }}
              className="text-amber-500 hover:text-amber-600 transition-colors"
            >
              Clear Active Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid activities List */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
            <p className="text-slate-400 font-bold italic uppercase tracking-wider text-xs">Scouting premium experiences...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black italic text-slate-900">Oops!</h3>
            <p className="text-slate-500 max-w-xs">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 rounded-xl">
              Try Again
            </Button>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm">
            <Sparkles className="h-12 w-12 text-slate-200 mb-4" />
            <h3 className="text-2xl font-black italic text-slate-900">No adventures found</h3>
            <p className="text-slate-500 max-w-xs mt-1">Try refining your search keyword or destination filters!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="group overflow-hidden border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] rounded-[2.5rem] bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 border border-slate-100 flex flex-col h-full hover:-translate-y-1">
                  
                  {/* Image with gradient overlays */}
                  <div className="h-64 relative overflow-hidden">
                    <img 
                      src={activity.imageUrl || "https://images.unsplash.com/photo-1596422846543-75c6fc18a593?w=800&q=80"} 
                      alt={activity.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                    
                    <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                       <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-black px-4 py-1.5 rounded-xl shadow-xl flex items-center gap-1 text-[10px]">
                          <MapPin className="h-3.5 w-3.5 text-amber-500" />
                          {activity.travelSpot?.name || "Global"}
                       </Badge>
                       <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                          <Sparkles className="h-4 w-4" />
                       </div>
                    </div>
    
                    <div className="absolute bottom-6 left-6">
                       <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-black text-white">4.8 verified</span>
                       </div>
                    </div>
                  </div>
    
                  {/* Card Main content */}
                  <CardContent className="p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-black font-heading italic tracking-tight text-slate-900 mb-4 truncate group-hover:text-amber-500 transition-colors">
                      {activity.title}
                    </h3>
                    
                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 line-clamp-2">
                       {activity.description}
                    </p>
    
                    {/* Stats table */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-400">
                             <Clock className="h-3 w-3" />
                             <span className="text-[10px] font-black uppercase tracking-widest leading-none">Duration</span>
                          </div>
                          <span className="text-sm font-bold text-slate-800">{activity.durationMinutes ? `${activity.durationMinutes}m` : "Flexible"}</span>
                       </div>
                       <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-400">
                             <BarChart className="h-3 w-3" />
                             <span className="text-[10px] font-black uppercase tracking-widest leading-none">Difficulty</span>
                          </div>
                          <span className={cn("text-sm font-bold", 
                            activity.difficulty === "Easy" ? "text-emerald-600" : 
                            activity.difficulty === "Moderate" ? "text-amber-600" : "text-rose-600")}>
                            {activity.difficulty || "Moderate"}
                          </span>
                       </div>
                    </div>
    
                    {/* Pricing & details Actions row */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto gap-4">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Starting Price</span>
                          <div className="flex items-baseline gap-1">
                             <span className="text-2xl font-black text-slate-900">₹{activity.pricePerPerson}</span>
                             <span className="text-[10px] font-bold text-slate-400">INR</span>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-2.5">
                         <Button 
                           variant="outline" 
                           onClick={() => router.push(`/activities/${activity.id}`)}
                           className="h-14 w-14 rounded-2xl border-2 hover:bg-slate-50 transition-all flex items-center justify-center p-0"
                         >
                           <Info className="h-5 w-5 text-amber-500" />
                         </Button>

                         <Button 
                           onClick={() => {
                             setNumberOfPersons(1);
                             setSelectedActivity(activity);
                           }}
                           disabled={isBooked(activity.id)}
                           className={cn(
                             "h-14 px-6 rounded-2xl font-black text-sm transition-all shadow-xl",
                             isBooked(activity.id) 
                               ? "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-none cursor-default"
                               : "bg-slate-900 text-white hover:bg-amber-500 hover:text-black hover:scale-105 shadow-slate-900/10"
                           )}
                         >
                           {isBooked(activity.id) ? (
                             <span className="flex items-center gap-2 text-xs">
                               <CheckCircle2 className="h-3.5 w-3.5" />
                               Registered
                             </span>
                           ) : "Book Quest"}
                         </Button>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Drawer Modal (Full Checkout support) */}
      <AnimatePresence>
        {selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isBooking && setSelectedActivity(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            />
            
            <motion.div
              layoutId={`activity-${selectedActivity.id}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-white/20"
            >
              {!selectedActivity ? null : (
                <>
                  <div className="h-48 relative overflow-hidden">
                    <img src={selectedActivity.imageUrl || "https://images.unsplash.com/photo-1596422846543-75c6fc18a593?w=800&q=80"} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
                    <div className="absolute top-6 right-6">
                      <Button 
                        variant="ghost" 
                        onClick={() => setSelectedActivity(null)}
                        className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-md text-slate-900 p-0"
                      >
                        <Sparkles className="h-4 w-4 rotate-45" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-10 -mt-20 relative z-10">
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
                      <h2 className="text-3xl font-black italic tracking-tight text-slate-900 mb-2">{selectedActivity.title}</h2>
                      <p className="text-slate-400 text-sm font-bold mb-8 uppercase tracking-widest">{selectedActivity.travelSpot?.name || "Global Experience"}</p>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Travelers</span>
                              <p className="text-lg font-bold text-slate-900">{numberOfPersons} Nomads</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setNumberOfPersons(Math.max(1, numberOfPersons - 1))}
                              className="h-10 w-10 rounded-lg border border-slate-200 flex items-center justify-center font-bold hover:bg-slate-50 transition-colors"
                            >
                              -
                            </button>
                            <span className="font-black text-xl w-6 text-center">{numberOfPersons}</span>
                            <button 
                              onClick={() => setNumberOfPersons(Math.min(10, numberOfPersons + 1))}
                              className="h-10 w-10 rounded-lg border border-slate-200 flex items-center justify-center font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dates</span>
                              <p className="text-lg font-bold text-slate-900">Mar 24, 2026</p>
                            </div>
                          </div>
                          <Button variant="ghost" className="text-amber-500 font-bold text-sm">Change</Button>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Price</span>
                            <p className="text-3xl font-black text-slate-900">₹{(selectedActivity.pricePerPerson * numberOfPersons).toLocaleString()}</p>
                          </div>
                          <Button 
                            disabled={isBooking}
                            onClick={handleAddToCart}
                            className="h-16 px-10 rounded-2xl bg-amber-500 text-black font-black text-lg hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
                          >
                            {isBooking ? "Adding..." : "Add to Cart"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
