"use client";

import { use, useState, useEffect } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDraggable,
  useDroppable,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Sparkles, 
  Clock, 
  Trash2, 
  GripVertical,
  Plus,
  Loader2,
  MapPin,
  Star,
  Info
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { tripService, ItineraryDayTimeline, ItineraryBlock, Trip } from "@/services/trip.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// --- Draggable Gem Component ---
function DraggableGem({ spot, onAdd }: { spot: any, onAdd?: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `gem-${spot.id}`,
    data: { type: 'NEW_SPOT', spot }
  });
  
  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="group p-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all"
    >
      <div className="flex gap-4">
        {/* Grip Handle */}
        <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 self-center">
            <GripVertical className="h-4 w-4" />
        </div>

        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
          <img src={spot.image} className="w-full h-full object-cover" alt={spot.name} />
        </div>
        <div className="flex-1 overflow-hidden">
          <h4 className="font-black text-sm truncate">{spot.name}</h4>
          <p className="text-[10px] text-slate-400 font-medium truncate mb-2">{spot.type || 'Attraction'}</p>
          <div className="flex items-center gap-2">
             <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[8px] px-2 py-0">
               {spot.distance.toFixed(1)} KM
             </Badge>
             <Button 
                size="icon"
                variant="ghost"
                className="h-6 w-6 rounded-full ml-auto hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAdd) onAdd(spot.id);
                }}
             >
                <Plus className="h-3 w-3" />
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sortable Block in Edit Mode ---
function SortableBlockEdit({ block, onRemove, onAddActivity }: { block: any, onRemove: (id: string) => void, onAddActivity: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: block.id,
    disabled: block.block_type === 'TRAVEL'
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.6 : 1,
  };

  if (block.block_type === 'TRAVEL') {
    return (
      <div className="py-2 opacity-50 select-none">
        <div className="flex items-center gap-4 px-6 py-2 bg-slate-50 border border-dashed border-slate-200 rounded-full text-[10px] font-black text-slate-400 italic">
          <Clock className="h-3 w-3" />
          {block.travel_time_minutes} MIN TRAVEL
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-white rounded-[2rem] border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4",
        isDragging && "shadow-xl ring-2 ring-primary/20"
      )}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="text-slate-300 hover:text-primary p-1 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
        <img src={block.image} className="w-full h-full object-cover" alt={block.name} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{block.block_type}</span>
          <Badge className="bg-primary/10 text-primary border-none text-[8px] px-1.5 py-0">
            {block.startTime}
          </Badge>
        </div>
        <h4 className="font-black text-sm truncate">{block.name}</h4>
      </div>

      <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => onRemove(block.id)}
          className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function EditItineraryPage({ params }: { params: Promise<{ tripId: string, day: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [data, setData] = useState<ItineraryDayTimeline | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nearbySpots, setNearbySpots] = useState<any[]>([]);
  const [activeItem, setActiveItem] = useState<any>(null);

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
    const tripDay = trip.tripDays?.find((d: any) => d.dayNumber === dayNumber);
    const itDay = trip.itineraryDays?.find((d: any) => d.dayNumber === dayNumber);
    const dayDateStr = tripDay?.date || itDay?.date;
    if (!dayDateStr) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDate = new Date(dayDateStr);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate < today;
  };

  const isLocked = isTripPassed() || isDayPassed();

  // Redirect on lock
  useEffect(() => {
    if (trip && isLocked) {
      toast.error("Timeline is locked!", {
        description: "This itinerary day has passed and cannot be modified."
      });
      router.replace(`/dashboard/trips/${resolvedParams.tripId}/days/${resolvedParams.day}`);
    }
  }, [trip, isLocked, router, resolvedParams.tripId, resolvedParams.day]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const tripData = await tripService.getTrip(resolvedParams.tripId);
      setTrip(tripData);

      const dayNumber = parseInt(resolvedParams.day);
      const itDay = tripData.itineraryDays?.find((d: any) => d.dayNumber === dayNumber);
      const tripDay = tripData.tripDays?.find((d: any) => d.dayNumber === dayNumber);
      const targetDayId = itDay?.id || tripDay?.id;

      if (!targetDayId) throw new Error("Timeline not found");

      const timelineData = await tripService.getDayTimeline(resolvedParams.tripId, targetDayId);
      
      // --- Ensure all standard slots (MORNING, AFTERNOON, EVENING) exist ---
      const SLOT_TYPES = ['MORNING', 'AFTERNOON', 'EVENING'] as const;
      const existingTypes = timelineData.slots.map(s => s.slot_type);
      
      SLOT_TYPES.forEach(type => {
        if (!existingTypes.includes(type)) {
          // Push a "virtual" slot that doesn't exist in DB yet
          timelineData.slots.push({
            id: `virtual-${type}`, // String ID for dnd-kit
            slot_type: type,
            start_time: type === 'MORNING' ? '08:00' : type === 'AFTERNOON' ? '12:00' : '17:00',
            end_time: type === 'MORNING' ? '12:00' : type === 'AFTERNOON' ? '17:00' : '22:00',
            blocks: [],
            // @ts-ignore - custom flag for UI
            isVirtual: true 
          });
        }
      });

      // Sort slots by type order
      timelineData.slots.sort((a, b) => {
        const orderMap = { 'MORNING': 1, 'AFTERNOON': 2, 'EVENING': 3 };
        return orderMap[a.slot_type] - orderMap[b.slot_type];
      });

      setData(timelineData);

      // --- Restoration of Nearby Spots Fetch ---
      const firstSpot = timelineData.slots.flatMap(s => s.blocks || []).find(b => b.latitude && b.longitude);
      if (firstSpot) {
        const nearby = await tripService.getNearbySpotsByCoords(firstSpot.latitude, firstSpot.longitude, 50, resolvedParams.tripId);
        setNearbySpots(nearby.spots || []);
      } else {
        // Fallback: If no spots in timeline yet, maybe fetch by trip destination?
        // For now, let's just keep existing or empty
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSpot = async (spotId: string) => {
    if (isLocked) return;
    const targetSlot = data?.slots[0];
    if (!targetSlot) {
      toast.error("No slots available to add spot.");
      return;
    }

    try {
      setSaving(true);
      const spot = nearbySpots.find(s => s.id === spotId);
      const isVirtual = targetSlot.id.startsWith('virtual-');
      const slotId = isVirtual ? null : targetSlot.id;
      const slotType = isVirtual ? targetSlot.slot_type : undefined;

      console.log("[EditPage] handleAddSpot (click):", { slotId, spotId, dayId: data?.id, slotType });
      await tripService.addSpotToSlot(slotId, spotId, data?.id || undefined, slotType);
      toast.success(`Added ${spot?.name || 'Spot'} to ${targetSlot.slot_type}!`);
      fetchData();
    } catch (err: any) {
      console.error("[EditPage] handleAddSpot ERROR:", err);
      toast.error("Failed to add spot.");
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;
    
    if (type === 'NEW_SPOT' && active.data.current?.spot) {
        setActiveItem({ type: 'NEW_SPOT', spot: active.data.current.spot });
    } else if (active.id) {
        // Find existing block
        const block = data?.slots.flatMap(s => s.blocks || []).find(b => b.id === active.id);
        if (block) setActiveItem({ type: 'BLOCK', block });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (isLocked) return;
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    // 1. Handle New Spot Dropped into a Slot
    if (active.data.current?.type === 'NEW_SPOT') {
        const spot = active.data.current.spot;
        const rawOverId = over.id.toString();
        const slotIdFromOver = rawOverId.startsWith('slot-') ? rawOverId.replace('slot-', '') : null;
        
        // Find slot by ID (real or virtual) OR by block it was dropped over
        const targetSlot = data?.slots.find(s => s.id === slotIdFromOver || s.blocks.some(b => b.id === over.id));
        
        if (targetSlot) {
            try {
                const isVirtual = targetSlot.id.startsWith('virtual-');
                const slotId = isVirtual ? null : targetSlot.id;
                const slotType = isVirtual ? targetSlot.slot_type : undefined;

                console.log("[EditPage] handleDragEnd (drop):", { slotId, spotId: spot.id, dayId: data?.id, slotType });
                await tripService.addSpotToSlot(slotId, spot.id, data?.id || undefined, slotType);
                toast.success(`Added ${spot.name} to ${targetSlot.slot_type}`);
                fetchData();
            } catch (err: any) {
                console.error("[EditPage] addSpotToSlot ERROR:", {
                  message: err.message,
                  response: err.response?.data,
                  status: err.response?.status
                });
                toast.error(err.response?.data?.error || "Failed to add spot.");
            }
        }
    }

    // 2. Handle Reordering
    else if (active.id !== over.id) {
        const activeSlot = data?.slots.find(s => s.blocks.some(b => b.id === active.id));
        const overSlot = data?.slots.find(s => s.id === over.id || s.blocks.some(b => b.id === over.id));

        if (activeSlot && overSlot && activeSlot.id === overSlot.id) {
            const oldIndex = activeSlot.blocks.findIndex(b => b.id === active.id);
            const newIndex = overSlot.blocks.findIndex(b => b.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                try {
                    await tripService.reorderBlocks(active.id as string, newIndex);
                    fetchData();
                    toast.success("Reordered!");
                } catch (err) {
                    toast.error("Reorder failed.");
                }
            }
        }
    }
  };

  const handleRemoveBlock = async (blockId: string) => {
    try {
      await tripService.removeBlock(blockId);
      toast.success("Removed from timeline");
      fetchData();
    } catch (err) {
      toast.error("Remove failed");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-50">
          <div className="flex items-center gap-4">
            <Link 
              href={`/dashboard/trips/${resolvedParams.tripId}/days/${resolvedParams.day}`}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-xl font-black font-heading leading-none">Editor Mode</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Day {resolvedParams.day} • {trip?.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button variant="ghost" onClick={() => router.back()} className="rounded-xl font-bold gap-2 text-slate-500">
                Cancel
             </Button>
             <Button 
                onClick={() => {
                  toast.success("Day itinerary finalized!");
                  router.push(`/dashboard/trips/${resolvedParams.tripId}/days/${resolvedParams.day}`);
                }}
                className="rounded-xl font-black gap-2 bg-black hover:bg-slate-800 text-white px-8 h-12"
             >
               Finalize Day
             </Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content (Timelines) */}
          <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
            <div className="max-w-3xl mx-auto space-y-16">
              {data?.slots.map((slot) => (
                <div key={slot.id} className="relative">
                   <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-[1.25rem] bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black font-heading tracking-tight">{slot.slot_type}</h3>
                                <span className="text-[10px] font-black text-primary uppercase">{slot.start_time} — {slot.end_time}</span>
                            </div>
                        </div>
                        <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[9px] px-3 py-1">
                            {slot.blocks.filter(b => b.block_type !== 'TRAVEL').length} ITEMS
                        </Badge>
                   </div>

                   {/* Slot Container (Droppable) */}
                   <SlotDroppable id={`slot-${slot.id}`}>
                      <div className="space-y-4 pl-12 border-l-2 border-slate-200 ml-6 min-h-[100px]">
                        <SortableContext items={(slot.blocks || []).map(b => b.id)} strategy={verticalListSortingStrategy}>
                            {(slot.blocks || []).map((block) => (
                                <SortableBlockEdit 
                                    key={block.id} 
                                    block={block} 
                                    onRemove={handleRemoveBlock}
                                    onAddActivity={() => {}} 
                                />
                            ))}
                        </SortableContext>
                        
                        {/* Drop Zone Placeholder */}
                        {(!slot.blocks || slot.blocks.length === 0) && (
                            <div className="h-24 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 font-bold text-sm italic">
                                Drop a gem here
                            </div>
                        )}
                      </div>
                   </SlotDroppable>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar (Gems) */}
          <aside className="w-[420px] bg-white border-l border-slate-200 flex flex-col shadow-2xl z-10">
            <div className="p-8 border-b border-slate-100">
               <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="h-6 w-6 text-amber-500 fill-amber-500" />
                    <h2 className="text-2xl font-black font-heading tracking-tight italic">Nearby Gems</h2>
               </div>
               <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                 Discover curated spots nearby. Drag them onto your timeline to instantly upgrade your journey.
               </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {nearbySpots.map((spot) => (
                <DraggableGem key={spot.id} spot={spot} onAdd={handleAddSpot} />
              ))}
              
              {nearbySpots.length === 0 && (
                <div className="text-center py-12 px-6">
                    <MapPin className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold text-sm">No nearby gems found.</p>
                    <p className="text-[10px] text-slate-300 font-bold uppercase mt-1">Try adding a spot first!</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Drag Overlay for smooth visuals */}
      <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
        {activeItem ? (
          activeItem.type === 'BLOCK' ? (
            <div className="bg-white rounded-[2rem] border-2 border-primary p-4 shadow-2xl flex items-center gap-4 w-72">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                 <img src={activeItem.block.image} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-black text-sm truncate">{activeItem.block.name}</h4>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border-2 border-amber-500 p-4 shadow-2xl flex items-center gap-4 w-72">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={activeItem.spot.image} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-black text-sm truncate">{activeItem.spot.name}</h4>
            </div>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Droppable Wrapper for Slots
function SlotDroppable({ id, children }: { id: string, children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className={cn("transition-colors rounded-[2.5rem]", isOver && "bg-primary/5")}>
            {children}
        </div>
    );
}
