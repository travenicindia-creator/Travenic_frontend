"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, PlusCircle, Clock, Zap, Star, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { tripService } from "@/services/trip.service";
import { cartService } from "@/services/cart.service";
import { ActivityDetailModal } from "@/components/ui/ActivityDetailModal";

interface ActivitySuggestionsProps {
  blocks: any[];
  slotId: string;
  onActivityAdded: () => void;
}

export function ActivitySuggestions({ blocks, slotId, onActivityAdded }: ActivitySuggestionsProps) {
  const params = useParams();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);

  // Extract all activities from all blocks in this slot
  const allActivities = blocks.flatMap(block => 
    (block.activities || []).map((a: any) => ({
      ...a,
      spotName: block.name,
      spotId: block.spot_id
    }))
  );

  const handleAddActivity = async (activityId: string) => {
    try {
      setAddingId(activityId);
      await tripService.addActivityToSlot(slotId, activityId);
      
      const activity = allActivities.find(a => a.id === activityId);
      if (activity && activity.price > 0) {
        await cartService.addToCart({
          tripId: params.tripId as string,
          type: 'ACTIVITY',
          activityId: activity.id,
          price: activity.price,
          numberOfPersons: 1,
        });
        toast.success(`${activity.title} added to plan & cart!`);
      } else {
        toast.success("Activity added to your plan!");
      }
      
      onActivityAdded();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add activity.");
    } finally {
      setAddingId(null);
    }
  };

  if (allActivities.length === 0) return null;

  return (
    <>
      <div className="relative mt-12 pb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-amber-100 rounded-xl">
            <Zap className="h-4 w-4 text-amber-600 fill-amber-600" />
          </div>
          <div className="flex flex-col">
            <h5 className="text-sm font-black uppercase tracking-widest text-slate-900">Bookable Experiences</h5>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Premium activities at your planned spots</p>
          </div>
          <div className="flex-1 h-[1px] bg-slate-100 ml-4" />
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide px-2 -mx-2">
          <AnimatePresence mode="popLayout">
            {allActivities.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedActivity(activity)}
                className="min-w-[340px] bg-white rounded-[2.5rem] border border-slate-100 p-5 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all group border-b-4 border-b-amber-500/20 cursor-pointer"
              >
                <div className="flex gap-5">
                  <div className="relative w-28 h-28 rounded-3xl overflow-hidden shadow-lg flex-shrink-0">
                    {activity.imageUrl ? (
                      <img 
                        src={activity.imageUrl} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt={activity.title} 
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <Star className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-amber-500 text-white border-none font-black text-[9px] px-2 py-0.5 shadow-lg">
                        QUEST
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="mb-2">
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-0.5">{activity.spotName}</p>
                      <h6 className="font-black text-slate-900 line-clamp-1 text-base leading-tight">{activity.name}</h6>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500">{activity.durationMinutes || 60}m</span>
                      </div>
                      <span className="h-1 w-1 rounded-full bg-slate-200" />
                      <span className="text-xs font-black text-slate-900 italic">₹{activity.price}</span>
                    </div>

                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddActivity(activity.id);
                      }}
                      disabled={activity.isBooked || addingId === activity.id}
                      className={cn(
                        "w-full rounded-2xl font-black h-10 text-[10px] gap-2 transition-all shadow-xl shadow-slate-200 group/btn",
                        activity.isBooked
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-50 hover:text-emerald-600 shadow-none cursor-default opacity-100"
                          : "bg-slate-900 hover:bg-amber-500 text-white"
                      )}
                    >
                      {addingId === activity.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : activity.isBooked ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          BOOKED & PAID
                        </>
                      ) : (
                        <>
                          <PlusCircle className="h-3 w-3 group-hover/btn:scale-125 transition-transform" />
                          ADD TO ITINERARY
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <ActivityDetailModal 
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        activity={selectedActivity}
        onAdd={handleAddActivity}
        addingId={addingId}
      />
    </>
  );
}

