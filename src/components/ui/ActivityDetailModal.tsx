"use client";

import { 
  Dialog, 
  DialogContent, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Zap, Star, MapPin, X, Mountain, Info } from "lucide-react";
import { useParams } from "next/navigation";
import { cartService } from "@/services/cart.service";
import { toast } from "sonner";
import Image from "next/image";

interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: any | null;
  onAdd: (activityId: string) => Promise<void>;
  addingId: string | null;
}

export function ActivityDetailModal({ isOpen, onClose, activity, onAdd, addingId }: ActivityDetailModalProps) {
  const params = useParams();
  const tripId = params.tripId as string;

  if (!activity) return null;

  const handleAddWithCart = async () => {
    try {
      await onAdd(activity.id);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add activity");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[3rem] bg-white gap-0">
        
        {/* Header Image Section */}
        <div className="relative h-72 w-full bg-slate-100">
          {activity.imageUrl ? (
            <Image 
              src={activity.imageUrl} 
              fill 
              sizes="(max-width: 768px) 100vw, 800px" 
              className="object-cover" 
              alt={activity.name} 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
              <Star className="h-16 w-16" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="absolute top-6 right-6 h-10 w-10 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md border border-white/10"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-6 left-8 right-8">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none font-black text-[10px] px-2.5 py-0.5 shadow-lg flex items-center gap-1">
                <Zap className="h-3 w-3 fill-white" />
                QUEST
              </Badge>
              {activity.spotName && (
                <Badge variant="outline" className="bg-white/10 border-white/20 text-white backdrop-blur-md font-bold text-[10px] px-2.5 py-0.5">
                  {activity.spotName}
                </Badge>
              )}
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              {activity.name}
            </h2>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</span>
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Clock className="h-4 w-4 text-amber-500" />
                {activity.durationMinutes}m
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Level</span>
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Mountain className="h-4 w-4 text-amber-500" />
                {activity.difficulty}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price</span>
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Zap className="h-4 w-4 text-amber-500" />
                {activity.price > 0 ? `₹${activity.price}` : "Free"}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              Experience Overview
            </h3>
            <p className="text-slate-600 leading-relaxed font-medium text-[15px]">
              {activity.description || "Enjoy a premium curated experience at this location. Immerse yourself in the local culture and create unforgettable memories with our expert guides."}
            </p>
          </div>

          {/* Action Footer */}
          <div className="pt-4 flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="rounded-2xl font-black h-14 px-6 border-2"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onClose();
                const tripQuery = tripId ? `?fromTrip=${tripId}&day=${params.day || ""}` : "";
                window.location.href = `/activities/${activity.id}${tripQuery}`;
              }}
              className="rounded-2xl font-black h-14 px-6 border-2 hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Info className="h-4.5 w-4.5 text-amber-500" />
              Full Details
            </Button>
            <Button 
              onClick={handleAddWithCart}
              disabled={addingId === activity.id}
              className="flex-1 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black h-14 gap-2 shadow-xl shadow-amber-500/20 text-base transition-all hover:scale-[1.02]"
            >
              {addingId === activity.id ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 fill-white" />
                  {activity.price > 0 ? "Add to Cart" : "Add to Plan"}
                </>
              )}
            </Button>
          </div>
        </div>


      </DialogContent>
    </Dialog>
  );
}
