"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tripService } from "@/services/trip.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Plus, Sparkles, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";

interface DraggableGemProps {
  spot: NearbySpot;
  idx: number;
  addingId: string | null;
  onAdd: (id: string) => void;
}

function DraggableGem({ spot, idx, addingId, onAdd }: DraggableGemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `gem-${spot.id}`,
    data: {
      type: 'GEM',
      spot
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ delay: idx * 0.05 }}
      className={cn(
        "min-w-[320px] bg-white rounded-[2.5rem] border border-slate-100 p-4 shadow-sm transition-all group cursor-grab active:cursor-grabbing",
        isDragging ? "shadow-2xl ring-2 ring-primary/20" : "hover:shadow-xl"
      )}
    >
      <div className="flex gap-4">
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
          {spot.image ? (
            <Image src={spot.image} fill sizes="(max-width: 768px) 100vw, 150px" className="absolute inset-0 object-cover group-hover:scale-110 transition-transform duration-500" alt={spot.name} />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
              <Star className="h-8 w-8" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge className="bg-black/60 backdrop-blur-md text-white border-none font-black text-[9px] px-2 py-0.5">
              {spot.distance.toFixed(1)} KM
            </Badge>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <h6 className="font-black text-slate-800 line-clamp-1 mb-1">{spot.name}</h6>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{spot.type || "Attraction"}</span>
            </div>
          </div>

          <Button 
            size="sm"
            onClick={(e) => {
              console.log("[NearbySuggestions] BUTTON Click triggered", { spotId: spot.id });
              e.preventDefault();
              e.stopPropagation();
              onAdd(spot.id);
            }}
            disabled={addingId === spot.id}
            className="w-full rounded-xl bg-slate-50 hover:bg-primary hover:text-white border border-slate-100 text-slate-600 font-black h-8 text-[10px] gap-1.5 transition-all shadow-none"
          >
            {addingId === spot.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
            Add to Trip
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

interface NearbySuggestionsProps {
  lat: number;
  lng: number;
  tripId: string;
  slotId: string;
  onSpotAdded: () => void;
  isEditing?: boolean;
}

interface NearbySpot {
  id: string;
  name: string;
  slug: string;
  image: string;
  latitude: number;
  longitude: number;
  type: string;
  description: string;
  distance: number;
  priority_score: number;
}

export function NearbySuggestions({ lat, lng, tripId, slotId, onSpotAdded, isEditing = false }: NearbySuggestionsProps) {
  const [spots, setSpots] = useState<NearbySpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    console.log("[NearbySuggestions] Mounted/Updated with props:", { lat, lng, tripId, slotId, isEditing });
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        console.log("[NearbySuggestions] Fetching suggestions for:", { lat, lng });
        const data = await tripService.getNearbySpotsByCoords(lat, lng, 50, tripId);
        console.log("[NearbySuggestions] Suggestions fetched:", data.spots?.length || 0, "spots");
        setSpots(data.spots?.slice(0, 5) || []);
      } catch (err: any) {
        console.error("[NearbySuggestions] Failed to fetch nearby suggestions:", err);
        toast.error("Nearby suggestions failed to load.");
      } finally {
        setLoading(false);
      }
    };

    if (lat !== 0 && lng !== 0) {
      fetchSuggestions();
    } else {
      setLoading(false);
    }
  }, [lat, lng, tripId, isEditing]);

  const handleAddSpot = async (spotId: string) => {
    console.log("[NearbySuggestions] handleAddSpot called:", { spotId, slotId, tripId });
    if (!slotId) {
      console.error("[NearbySuggestions] MISSING SLOT ID!");
      toast.error("Cannot add spot: missing slot information.");
      return;
    }
    
    try {
      setAddingId(spotId);
      console.log("[NearbySuggestions] API Call: addSpotToSlot...", { slotId, spotId });
      const result = await tripService.addSpotToSlot(slotId, spotId);
      console.log("[NearbySuggestions] API Success:", result);
      toast.success("Spot added to itinerary!", {
        description: "Your timeline has been recalculated."
      });
      setSpots(prev => prev.filter(s => s.id !== spotId));
      onSpotAdded();
    } catch (err: any) {
      console.error("[NearbySuggestions] handleAddSpot EXCEPTION:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      toast.error(err.response?.data?.error || "Failed to add spot.");
    } finally {
      setAddingId(null);
    }
  };

  // Removed !isEditing check to allow seeing suggestions in view mode

  if (lat === 0 || lng === 0) {
    return (
      <div className="relative mt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <h5 className="text-sm font-black uppercase tracking-widest text-slate-400">Nearby Gems</h5>
        </div>
        <div className="bg-white/50 border-2 border-dashed border-slate-100 rounded-[2rem] p-8 text-center cursor-default">
          <p className="text-slate-400 font-bold text-sm italic">Add a spot to see nearby gems!</p>
          <p className="text-[10px] text-slate-300 font-bold uppercase mt-1">We need a location reference to find gems for you</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden py-4 opacity-50">
        {[1, 2, 3].map(i => (
          <div key={i} className="min-w-[280px] h-40 bg-slate-200 animate-pulse rounded-[2rem]" />
        ))}
      </div>
    );
  }

  if (spots.length === 0) {
    return (
      <div className="relative mt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <h5 className="text-sm font-black uppercase tracking-widest text-slate-400">Nearby Gems</h5>
        </div>
        <div className="bg-white/50 border-2 border-dashed border-slate-100 rounded-[2rem] p-8 text-center">
          <p className="text-slate-400 font-bold text-sm italic">No nearby spots found for this location yet.</p>
          <p className="text-[10px] text-slate-300 font-bold uppercase mt-1">Try adding more spots to your timeline to see suggestions</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative mt-8"
      onClickCapture={(e) => {
        console.log("[NearbySuggestions] ROOT DIV Capture Click triggered");
        // We don't stop propagation here yet, just log
      }}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <h5 className="text-sm font-black uppercase tracking-widest text-slate-400">Nearby Gems</h5>
        <div className="flex-1 h-[1px] bg-slate-100 ml-2" />
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide px-2 -mx-2">
        <AnimatePresence mode="popLayout">
          {spots.map((spot, idx) => (
            <DraggableGem 
              key={spot.id} 
              spot={spot} 
              idx={idx} 
              addingId={addingId} 
              onAdd={handleAddSpot} 
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
