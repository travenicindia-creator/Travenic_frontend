"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { User, MapPin, Clock, Calendar, Users, Loader2, X } from "lucide-react";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: any) => void;
  vehicleName: string;
  price: number;
  pickupPoints?: Array<{ id: string; name: string }>;
}

export function BookingDetailsModal({ isOpen, onClose, onConfirm, vehicleName, price, pickupPoints = [] }: BookingDetailsModalProps) {
  const [details, setDetails] = useState({
    name: "",
    pickupLocation: "",
    pickupTime: "",
    startDate: "",
    endDate: "",
    persons: "1"
  });

  const calculateTotal = () => {
    if (!details.startDate || !details.endDate) return price;
    const start = new Date(details.startDate);
    const end = new Date(details.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return price * diffDays;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ ...details, totalAmount: calculateTotal() });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-none shadow-2xl p-0 overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full h-8 w-8 flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors z-10"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic tracking-tight">Booking Details</DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-widest text-primary/70">
                Confirm your {vehicleName} journey
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    required
                    value={details.name}
                    onChange={e => setDetails({...details, name: e.target.value})}
                    placeholder="Enter your name"
                    className="h-12 pl-10 bg-muted/30 border-none rounded-xl font-medium focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Start Date</Label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      required
                      type="date"
                      value={details.startDate}
                      onChange={e => setDetails({...details, startDate: e.target.value})}
                      className="h-12 pl-10 bg-muted/30 border-none rounded-xl font-medium focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">End Date</Label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      required
                      type="date"
                      value={details.endDate}
                      onChange={e => setDetails({...details, endDate: e.target.value})}
                      className="h-12 pl-10 bg-muted/30 border-none rounded-xl font-medium focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Pickup Location</Label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <select 
                    required
                    value={details.pickupLocation}
                    onChange={e => setDetails({...details, pickupLocation: e.target.value})}
                    className="w-full h-12 pl-10 pr-4 bg-muted/30 border-none rounded-xl font-medium focus-visible:ring-primary/20 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select pickup location</option>
                    {pickupPoints.map(point => (
                      <option key={point.id} value={point.name} className="bg-background text-foreground">
                        {point.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                     <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Pickup Time</Label>
                  <div className="relative group">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      required
                      type="time"
                      value={details.pickupTime}
                      onChange={e => setDetails({...details, pickupTime: e.target.value})}
                      className="h-12 pl-10 bg-muted/30 border-none rounded-xl font-medium focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Travelers</Label>
                  <div className="relative group">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      required
                      type="number"
                      min="1"
                      value={details.persons}
                      onChange={e => setDetails({...details, persons: e.target.value})}
                      className="h-12 pl-10 bg-muted/30 border-none rounded-xl font-medium focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-muted/20 border-t border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-[10px] font-black uppercase text-muted-foreground">Total Price ({Math.max(1, Math.ceil((new Date(details.endDate).getTime() - new Date(details.startDate).getTime()) / (1000 * 60 * 60 * 24))) || 1} Days)</div>
                <div className="text-xl font-black text-primary italic">₹{calculateTotal()}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                type="button"
                variant="ghost"
                onClick={onClose}
                className="h-12 px-6 rounded-xl font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="h-12 px-8 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.05]"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
