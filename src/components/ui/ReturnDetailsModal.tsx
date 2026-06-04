"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plane, TrainFront, Bus, Car, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { tripService } from "@/services/trip.service";
import { toast } from "sonner";

interface ReturnDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  initialData?: {
    mode: 'flight' | 'train' | 'bus' | 'car';
    fromLocation: string;
    toLocation: string;
    departureTime: string;
    arrivalTime?: string | null;
    notes?: string | null;
  };
  onSuccess: () => void;
}

export function ReturnDetailsModal({ isOpen, onClose, tripId, initialData, onSuccess }: ReturnDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mode: 'car' as 'flight' | 'train' | 'bus' | 'car',
    from_location: "",
    to_location: "",
    departure_time: "",
    notes: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        mode: initialData.mode,
        from_location: initialData.fromLocation,
        to_location: initialData.toLocation,
        departure_time: initialData.departureTime ? new Date(initialData.departureTime).toISOString().slice(0, 16) : "",
        notes: initialData.notes || ""
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tripService.upsertTripEndDetails(tripId, formData);
      toast.success("Return journey details updated!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update return details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <DialogHeader className="p-6 bg-muted/30">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <ArrowLeft className="h-6 w-6 text-primary" />
            Return Journey
          </DialogTitle>
          <DialogDescription>
            How are you heading back home?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-4 gap-3">
              {[
                { mode: 'flight', icon: Plane, label: 'Flight', color: 'text-blue-500', bg: 'bg-blue-50' },
                { mode: 'train', icon: TrainFront, label: 'Train', color: 'text-orange-500', bg: 'bg-orange-50' },
                { mode: 'bus', icon: Bus, label: 'Bus', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { mode: 'car', icon: Car, label: 'Car', color: 'text-purple-500', bg: 'bg-purple-50' },
              ].map((m) => {
                const Icon = m.icon;
                const isActive = formData.mode === m.mode;
                return (
                  <button
                    key={m.mode}
                    type="button"
                    onClick={() => setFormData({ ...formData, mode: m.mode as any })}
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
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">From</label>
                <Input
                  placeholder="Starting location"
                  value={formData.from_location}
                  onChange={(e) => setFormData({ ...formData, from_location: e.target.value })}
                  className="h-12 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">To</label>
                <Input
                  placeholder="Home destination"
                  value={formData.to_location}
                  onChange={(e) => setFormData({ ...formData, to_location: e.target.value })}
                  className="h-12 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Departure Time</label>
                <Input
                  type="datetime-local"
                  value={formData.departure_time}
                  onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                  className="h-12 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/30 flex sm:justify-between items-center gap-4">
            <Button type="button" variant="ghost" onClick={onClose} className="font-bold">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px] rounded-xl font-bold gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
