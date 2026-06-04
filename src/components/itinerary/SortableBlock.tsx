"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Car, Route, MapPin, Star, Utensils, Timer, 
  GripVertical, Info, ExternalLink, Trash2, PlusCircle, 
  Sparkles, Loader2, ChevronDown, ChevronUp, CheckCircle2, Zap, Bus, Bike
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SpotVisitedToggle } from "@/components/features/SpotVisitedToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { tripService } from "@/services/trip.service";
import { cartService } from "@/services/cart.service";
import { ActivityDetailModal } from "@/components/ui/ActivityDetailModal";
import { InterDestinationTransportModal, PublicTransportModal, LocalTransportModal } from "./TransportModals";

interface SortableBlockProps {
  block: any;
  tripId: string;
  dayNumber: string;
  isEditing?: boolean;
  isLocked?: boolean;
  onRemove?: (blockId: string) => void;
  onAddActivity?: (blockId: string, activityId: string) => void;
}

export function SortableBlock({ 
  block, 
  tripId, 
  dayNumber, 
  isEditing = false,
  isLocked = false,
  onRemove,
  onAddActivity
}: SortableBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [addingActivity, setAddingActivity] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [isTransitOpen, setIsTransitOpen] = useState(false);
  const [isPublicTransportOpen, setIsPublicTransportOpen] = useState(false);
  const [isLocalTransportOpen, setIsLocalTransportOpen] = useState(false);

  const params = useParams();
  const handleAddActivity = async (activityId: string) => {
    if (isLocked) {
      toast.error("This day timeline is locked and cannot be modified.");
      return;
    }
    setAddingActivity(activityId);
    try {
      await onAddActivity?.(block.id, activityId);
      
      const activity = block.activities?.find((a: any) => a.id === activityId);
      if (activity && activity.price > 0) {
        await cartService.addToCart({
          tripId: params.tripId as string,
          type: 'ACTIVITY',
          activityId: activity.id,
          price: activity.price,
          numberOfPersons: 1,
        });
        toast.success(`${activity.name} added to plan & cart!`);
      } else {
        toast.success("Activity added to your plan!");
      }
    } catch (err) {
      toast.error("Failed to add activity");
    } finally {
      setAddingActivity(null);
    }
  };

  const isInterDestination = block.block_type === 'TRAVEL' && block.travel_type === 'inter_destination';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: block.id,
    disabled: !isEditing || isLocked || (block.block_type === 'TRAVEL' && !isInterDestination)
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.6 : 1,
  };

  if (block.block_type === 'TRAVEL') {
    return (
      <>
        <div 
          ref={setNodeRef} 
          style={style}
          {...(isEditing && !isLocked && isInterDestination ? { ...attributes, ...listeners } : {})}
          className={cn(
            "group relative transition-all py-2 outline-none",
            isEditing && !isLocked && isInterDestination ? "cursor-grab active:cursor-grabbing" : isInterDestination ? "cursor-pointer" : "cursor-default"
          )}
        >
          <div className={cn(
            "flex items-center gap-6 py-2 px-8 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] transition-all",
            "hover:bg-primary/5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
            isDragging && "opacity-60 ring-4 ring-primary/30 border-primary shadow-xl scale-[1.02] z-50",
          )}>
            <div 
              onClick={() => setIsTransitOpen(true)}
              className={cn(
                "flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 text-slate-400 border border-slate-200 transition-colors cursor-pointer hover:scale-110",
                "group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20"
              )}
            >
              <Car className="h-5 w-5" />
            </div>
            <div className="flex-1 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-black italic text-slate-500 uppercase flex items-center gap-2">
                  <Route className="h-3 w-3" />
                  {isInterDestination ? 'Inter-City Travel' : 'Travel Session'}
                </span>
                {isInterDestination && block.from && block.to && (
                  <p className="text-[10px] font-bold text-primary/60 uppercase tracking-tight">
                    {block.from} → {block.to}
                  </p>
                )}
              </div>

              {/* Premium Sliding Car along dashed road lane */}
              <div className="hidden md:flex items-center justify-center flex-1 px-4">
                <div 
                  onClick={() => setIsTransitOpen(true)}
                  className="relative w-44 h-4 bg-slate-900 rounded-full border border-slate-800 shadow-inner flex items-center px-2 cursor-pointer group/road hover:border-primary/40 transition-colors"
                >
                  <div 
                    className="absolute inset-x-0 h-[1px] border-t border-dashed border-amber-400/40" 
                    style={{ borderStyle: 'dashed', borderWidth: '1px' }} 
                  />
                  
                  <motion.div
                    className="absolute text-emerald-400"
                    initial={{ x: "0%" }}
                    animate={{ x: "85%" }}
                    transition={{
                      repeat: Infinity,
                      duration: 3.5,
                      ease: "easeInOut",
                      repeatType: "reverse"
                    }}
                  >
                    <Car className="h-3.5 w-3.5 fill-emerald-400/10 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] group-hover/road:scale-125 transition-transform" />
                  </motion.div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-400">{block.distance_km} KM</span>
                  <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-3 py-1">
                    {block.travel_time_minutes} MIN DRIVE
                  </Badge>
                </div>

                {isInterDestination && block.to && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLocalTransportOpen(true);
                    }}
                    className="rounded-full h-8 px-4 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-500/50 font-black text-[10px] uppercase shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Bike className="h-3.5 w-3.5" />
                    Rentals in {block.to}
                  </Button>
                )}

                {isInterDestination && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsTransitOpen(true)}
                    className="rounded-full h-8 px-4 bg-primary text-white hover:bg-primary/90 font-black text-[10px] uppercase shadow-md shadow-primary/20"
                  >
                    View Travel Options
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inter-Destination Transport Modal */}
        <InterDestinationTransportModal 
          isOpen={isTransitOpen}
          onClose={() => setIsTransitOpen(false)}
          block={block}
          tripId={tripId}
          dayNumber={dayNumber}
        />

        {/* Local Transport Modal */}
        {isInterDestination && block.to && (
          <LocalTransportModal 
            isOpen={isLocalTransportOpen}
            onClose={() => setIsLocalTransportOpen(false)}
            block={block}
            tripId={tripId}
            dayNumber={dayNumber}
          />
        )}
      </>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative transition-all bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-2xl hover:shadow-slate-200",
        isDragging && "shadow-2xl ring-2 ring-primary/20 border-primary/20",
        !isEditing && "hover:border-slate-100"
      )}
    >
      {/* Drag Handle (Only in Edit Mode) */}
      {isEditing && !isLocked && (
        <div 
          {...attributes} 
          {...listeners}
          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-2 text-slate-300 hover:text-primary"
        >
          <GripVertical className="h-6 w-6" />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <Link 
          href={`/spots/${block.spot_id || block.slug}?fromTrip=${tripId}&day=${dayNumber}`} 
          className={cn(
            "w-full md:w-56 h-48 md:h-40 rounded-[2rem] overflow-hidden relative shadow-lg bg-slate-100 block group/img",
            (isEditing || isLocked) && "pointer-events-none"
          )}
        >
          {block.image ? (
            <Image src={block.image} fill sizes="(max-width: 768px) 100vw, 250px" className="absolute inset-0 object-cover group-hover/img:scale-110 transition-transform duration-500" alt={block.name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              {block.block_type === 'FOOD' ? <Utensils className="h-12 w-12" /> : <Star className="h-12 w-12" />}
            </div>
          )}
          <div className="absolute top-4 left-4">
            <Badge className="bg-black/60 backdrop-blur-md text-white border-none font-black text-[10px] px-3 py-1">
              {block.startTime} — {block.endTime}
            </Badge>
          </div>
        </Link>

        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            {block.block_type === 'SPOT' && <MapPin className="h-4 w-4 text-emerald-500" />}
            {block.block_type === 'ACTIVITY' && <Star className="h-4 w-4 text-amber-500" />}
            {block.block_type === 'FOOD' && <Utensils className="h-4 w-4 text-orange-500" />}
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{block.block_type}</span>
          </div>
          <Link href={`/spots/${block.spot_id || block.slug}?fromTrip=${tripId}&day=${dayNumber}`} className={cn((isEditing || isLocked) && "pointer-events-none")}>
            <h4 className="text-2xl font-black font-heading mb-3 hover:text-primary transition-colors leading-tight">{block.name}</h4>
          </Link>
          
          {block.description && (
            <p className="text-slate-400 text-xs font-medium line-clamp-2 italic mb-4">"{block.description}"</p>
          )}

          <div className="flex flex-wrap gap-4 mt-auto">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <Timer className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Session Time</p>
                <p className="text-xs font-black">{block.visit_duration || block.duration} Minutes</p>
              </div>
            </div>

            {block.block_type === 'SPOT' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "rounded-2xl h-10 border-2 font-black text-[10px] gap-2 transition-all",
                  isExpanded ? "bg-primary text-white border-primary" : "border-primary/20 text-primary hover:border-primary"
                )}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {isExpanded ? "CLOSE ACTIVITIES" : "VIEW ACTIVITIES"}
                {block.activities?.length > 0 && (
                  <Badge className="bg-primary/20 text-primary border-none ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {block.activities.length}
                  </Badge>
                )}
              </Button>
            )}

            {!isEditing && (
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 cursor-pointer hover:bg-emerald-50 transition-colors">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  <Link href={`https://www.google.com/maps/search/?api=1&query=${block.latitude},${block.longitude}`} target="_blank">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Location</p>
                    <p className="text-xs font-black">Open Map</p>
                  </Link>
                </div>
                
                {block.block_type === 'SPOT' && (
                  <div 
                    onClick={() => setIsPublicTransportOpen(true)}
                    className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 cursor-pointer hover:bg-emerald-50 hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all relative group"
                  >
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <Bus className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Public Transit</p>
                      <p className="text-xs font-black text-emerald-600">Transit Routes</p>
                    </div>
                  </div>
                )}

                {block.block_type === 'SPOT' && block.spot_id && !isLocked && (
                  <div className="flex items-center">
                    <SpotVisitedToggle spotId={block.spot_id} tripId={tripId} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex md:flex-col justify-center gap-3">
          {isEditing ? (
            <Button 
              size="icon" 
              variant="ghost" 
              disabled={isLocked}
              onClick={() => !isLocked && onRemove?.(block.id)}
              className="rounded-2xl h-12 w-12 text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          ) : (
            <>
              <Button size="icon" variant="ghost" className="rounded-2xl h-12 w-12 hover:bg-primary/10 hover:text-primary transition-colors">
                <ExternalLink className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="outline" className="rounded-2xl h-12 w-12 border-2 shadow-sm">
                <Info className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Expandable Activities Section */}
      <AnimatePresence>
        {isExpanded && block.activities && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-6 pt-6 border-t border-slate-100"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-sm font-black italic text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Available Quests at {block.name}
                </h5>
                <Badge variant="outline" className="rounded-lg text-[10px] font-bold py-1">
                  PREMIUM CURATION
                </Badge>
              </div>

              {block.activities.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-400 italic">No bookable activities found for this spot yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {block.activities.map((activity: any) => (
                    <div 
                      key={activity.id}
                      onClick={() => !isLocked && setSelectedActivity(activity)}
                      className={cn(
                        "bg-slate-50/50 rounded-3xl p-4 border border-slate-100 hover:bg-white hover:shadow-lg transition-all group/act",
                        !isLocked && "cursor-pointer"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h6 className="font-black text-sm text-slate-900 mb-1 group-hover/act:text-primary transition-colors">{activity.name}</h6>
                          <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mb-3">{activity.description}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-primary">₹{activity.price}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span className="text-[10px] font-bold text-slate-400">{activity.durationMinutes || activity.duration || 60} MIN</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          disabled={isLocked || activity.isBooked || addingActivity === activity.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddActivity(activity.id);
                          }}
                          className={cn(
                            "h-10 px-4 rounded-xl font-black text-[10px] transition-all",
                            activity.isBooked 
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-50 hover:text-emerald-600 shadow-none cursor-default opacity-100"
                              : isLocked
                                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                                : "bg-slate-900 text-white hover:bg-primary shadow-lg shadow-slate-200"
                          )}
                        >
                          {addingActivity === activity.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : activity.isBooked ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                              BOOKED
                            </>
                          ) : isLocked ? (
                            <>
                              LOCKED
                            </>
                          ) : (
                            <>
                              <PlusCircle className="h-3 w-3 mr-2" />
                              ADD
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal 
          activity={{
            ...selectedActivity,
            spotName: block.name,
            spotId: block.spot_id || block.spotId
          }}
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onAdd={async (id) => {
            if (isLocked) return;
            await handleAddActivity(id);
          }}
          addingId={addingActivity}
        />
      )}

      {/* Public Transport Modal */}
      <PublicTransportModal 
        isOpen={isPublicTransportOpen}
        onClose={() => setIsPublicTransportOpen(false)}
        block={block}
      />

      {/* Inter-Destination Transport Modal */}
      <InterDestinationTransportModal 
        isOpen={isTransitOpen}
        onClose={() => setIsTransitOpen(false)}
        block={block}
        tripId={tripId}
        dayNumber={dayNumber}
      />
    </div>
  );
}
