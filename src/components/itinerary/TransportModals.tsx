"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { 
  Car, Bike, Plane, Train, MapPin, Clock, Coins, Leaf, 
  Zap, Check, CheckCircle2, Loader2, X, ArrowRight, Shield, 
  Info, Phone, Users, Calendar, Sparkles, Navigation,
  Bus, QrCode, Ticket, Compass, Power, ChevronDown, Star
} from "lucide-react";
import { getTransportMarketplace, MarketplaceVehicle } from "@/services/features.service";
import { cartService } from "@/services/cart.service";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { getPublicTransportOptions, PublicTransportData, TransitOption } from "@/utils/publicTransport";
import { BookingDetailsModal } from "./BookingDetailsModal";

interface LocalTransportModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: any;
  tripId: string;
  dayNumber: string;
}

export function LocalTransportModal({ isOpen, onClose, block, tripId, dayNumber }: LocalTransportModalProps) {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<MarketplaceVehicle[]>([]);
  const [pickupPoints, setPickupPoints] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<MarketplaceVehicle | null>(null);
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'RENTAL_BIKE' | 'RENTAL_CAR'>('ALL');

  const destinationCity = block?.to || "";

  useEffect(() => {
    if (isOpen && destinationCity) {
      loadLocalMarketplace();
    }
  }, [isOpen, tripId, destinationCity]);

  const loadLocalMarketplace = async () => {
    try {
      setLoading(true);
      const data = await getTransportMarketplace(undefined, tripId, destinationCity);
      if (data) {
        setVehicles(data.marketplace || []);
        setPickupPoints(data.pickupPoints || []);
      }
    } catch (err) {
      console.error("Failed to load local transport marketplace:", err);
      toast.error("Failed to load local transport options.");
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateBooking = (vehicle: MarketplaceVehicle, listing: any) => {
    setSelectedVehicle(vehicle);
    setSelectedListing(listing);
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = async (details: any) => {
    if (!selectedVehicle || !selectedListing) return;

    setIsBookingOpen(false);
    setLoading(true);

    try {
      await cartService.addToCart({
        tripId,
        type: 'TRANSPORT',
        transportListingId: selectedListing.id,
        price: details.totalAmount || selectedListing.price,
        transportDetails: {
          ...details,
          vehicleName: selectedVehicle.name,
          providerName: selectedListing.provider.name,
          phone: selectedListing.provider.phone,
          city: destinationCity,
          dayNumber
        },
        scheduledDate: details.startDate
      });

      toast.success(`${selectedVehicle.name} added to cart for local travel in ${destinationCity}!`);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add local transport to cart.");
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    if (activeFilter === 'ALL') return true;
    return v.type === activeFilter;
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-slate-50/90 gap-0 backdrop-blur-xl animate-in fade-in-50 duration-200">
          {/* Header */}
          <div className="p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative border-b border-white/5">
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all z-10 border border-white/10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[9px] px-2.5 py-0.5 flex items-center gap-1.5 uppercase tracking-wider">
                <Bike className="h-3 w-3 animate-pulse" />
                Local Transport & Rentals
              </Badge>
              {destinationCity && (
                <Badge variant="outline" className="border-white/20 text-white font-bold text-[9px] uppercase">
                  City: {destinationCity}
                </Badge>
              )}
            </div>

            <h2 className="text-2xl font-black tracking-tight leading-none mb-1 font-heading bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Arrived at {destinationCity}? Let's Roll!
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Rent a bike, scooter, or car locally to travel around {destinationCity} at your own pace.
            </p>
          </div>

          {/* Filter Tab bar */}
          <div className="px-8 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Fleets</span>
            <div className="flex gap-2">
              <Button
                variant={activeFilter === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('ALL')}
                className="h-8 rounded-xl font-bold text-[10px] uppercase px-3"
              >
                All Rides
              </Button>
              <Button
                variant={activeFilter === 'RENTAL_BIKE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('RENTAL_BIKE')}
                className="h-8 rounded-xl font-bold text-[10px] uppercase px-3 gap-1.5"
              >
                <Bike className="h-3.5 w-3.5" />
                Bikes & Scooters
              </Button>
              <Button
                variant={activeFilter === 'RENTAL_CAR' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('RENTAL_CAR')}
                className="h-8 rounded-xl font-bold text-[10px] uppercase px-3 gap-1.5"
              >
                <Car className="h-3.5 w-3.5" />
                Cars
              </Button>
            </div>
          </div>

          {/* Body List */}
          <div className="p-8 max-h-[55vh] overflow-y-auto bg-slate-50/50 space-y-6">
            {loading && vehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Loading Premium Fleet...</p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-200 p-8 shadow-sm">
                <div className="inline-flex h-12 w-12 rounded-full bg-slate-50 text-slate-400 items-center justify-center mb-4">
                  <Info className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">No Local Commutes Found</h3>
                <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                  We currently do not have local bike or car rental listings seeded in {destinationCity} yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredVehicles.map(vehicle => (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden bg-white border border-slate-150/60 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-emerald-500/20 transition-all flex flex-col md:flex-row"
                  >
                    {/* Vehicle Image */}
                    <div className="relative w-full md:w-56 h-48 md:h-auto bg-slate-50 shrink-0">
                      {vehicle.imageUrl ? (
                        <img
                          src={vehicle.imageUrl}
                          alt={vehicle.name}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-350 bg-slate-100">
                          {vehicle.type === 'RENTAL_CAR' ? <Car className="h-12 w-12" /> : <Bike className="h-12 w-12" />}
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-slate-900/80 backdrop-blur-md text-white border-none font-black text-[9px] uppercase tracking-wider px-3 py-1">
                          {vehicle.type === 'RENTAL_CAR' ? 'Rental Car' : 'Rental Bike'}
                        </Badge>
                      </div>
                    </div>

                    {/* Vehicle Details & Vendors List */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{vehicle.name}</h3>
                        {vehicle.description && (
                          <p className="text-xs text-slate-400 font-medium mb-4 italic">"{vehicle.description}"</p>
                        )}

                        {/* Vendors grid */}
                        <div className="space-y-3.5 mt-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Available Local Vendors</span>
                          {vehicle.listings.map(listing => (
                            <div
                              key={listing.id}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:border-emerald-500/20 hover:bg-emerald-50/10 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-white border border-slate-150 flex items-center justify-center font-black text-xs text-slate-500 uppercase">
                                  {listing.provider.name.substring(0, 2)}
                                </div>
                                <div>
                                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 leading-none mb-1">
                                    {listing.provider.name}
                                    <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-none font-bold text-[8px] h-4.5 px-1.5 flex items-center gap-0.5">
                                      <Star className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />
                                      {listing.provider.rating}
                                    </Badge>
                                  </h4>
                                  <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                    <Phone className="h-2.5 w-2.5 text-slate-400" />
                                    {listing.provider.phone}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                                <div>
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Rate / Day</span>
                                  <span className="text-sm font-black text-primary font-mono italic">₹{listing.price}</span>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleInitiateBooking(vehicle, listing)}
                                  className="h-8.5 px-4 rounded-xl bg-slate-900 hover:bg-primary text-white font-black text-[9px] uppercase tracking-wider shadow-md shadow-slate-100"
                                >
                                  Book Ride
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Embedded Details Booking Form */}
      {selectedVehicle && selectedListing && (
        <BookingDetailsModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          onConfirm={handleConfirmBooking}
          vehicleName={selectedVehicle.name}
          price={selectedListing.price}
          pickupPoints={pickupPoints}
        />
      )}
    </>
  );
}

// ─── SCENIC TRAVEL VISUALIZER ────────────────────────────────────────────────

interface ScenicTravelVisualizerProps {
  from: string;
  to: string;
  mode: "TRAIN" | "FLIGHT" | "CAB" | "BUS";
}

export function ScenicTravelVisualizer({ from, to, mode }: ScenicTravelVisualizerProps) {
  return (
    <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex flex-col justify-between p-4">
      {/* Background Layer based on mode */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {mode === "FLIGHT" && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950">
            {/* Stars */}
            <div className="absolute top-4 left-1/4 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse" />
            <div className="absolute top-10 left-2/3 w-1 h-1 bg-white rounded-full opacity-40 animate-pulse delay-500" />
            <div className="absolute top-6 left-1/2 w-1.5 h-1.5 bg-white rounded-full opacity-80 animate-pulse delay-1000" />
            <div className="absolute top-20 left-12 w-1 h-1 bg-white rounded-full opacity-30 animate-pulse delay-300" />
            {/* Clouds floating by */}
            <motion.div
              className="absolute -right-32 top-6 opacity-30"
              initial={{ x: 0 }}
              animate={{ x: "-120vw" }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            >
              <svg width="120" height="40" viewBox="0 0 120 40" fill="white">
                <path d="M20 35a15 15 0 0 1 0-30c1 0 2 0 3 .2A20 20 0 0 1 60 15a15 15 0 0 1 29.5-3.5 15 15 0 0 1 10.5 23.5Z" />
              </svg>
            </motion.div>
            <motion.div
              className="absolute -right-32 top-16 opacity-20"
              initial={{ x: 0 }}
              animate={{ x: "-120vw" }}
              transition={{ repeat: Infinity, duration: 18, ease: "linear", delay: 4 }}
            >
              <svg width="160" height="50" viewBox="0 0 160 50" fill="white">
                <path d="M25 45a20 20 0 0 1 0-40c2 0 4 .3 6 .8A25 25 0 0 1 80 20a20 20 0 0 1 39.5-4.5A20 20 0 0 1 135 45Z" />
              </svg>
            </motion.div>
          </div>
        )}

        {mode === "TRAIN" && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900">
            {/* Mountain outlines */}
            <svg className="absolute bottom-0 left-0 w-full h-12 text-slate-800/40 fill-current" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="0,100 20,40 40,80 60,30 80,70 100,50 100,100" />
            </svg>
            {/* Trees passing by */}
            <motion.div 
              className="absolute bottom-6 flex gap-32 text-emerald-800/30 font-bold"
              initial={{ x: "100%" }}
              animate={{ x: "-100%" }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <svg key={i} width="16" height="24" viewBox="0 0 16 24" fill="currentColor">
                  <polygon points="8,0 0,16 5,16 2,24 14,24 11,16 16,16" />
                </svg>
              ))}
            </motion.div>
          </div>
        )}

        {mode === "CAB" && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-sky-950/60 to-slate-900">
            {/* Hilly roadside */}
            <svg className="absolute bottom-0 left-0 w-full h-10 text-emerald-950/30 fill-current" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 80 Q 25 50, 50 70 T 100 60 L 100 100 L 0 100 Z" />
            </svg>
            {/* Mountain outlines */}
            <svg className="absolute bottom-0 left-0 w-full h-16 text-slate-800/20 fill-current" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="0,100 30,30 70,80 100,40 100,100" />
            </svg>
          </div>
        )}

        {mode === "BUS" && (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70">
            {/* Sunset glow */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-orange-500/10 to-transparent" />
            {/* Roadside lights blinking past */}
            <motion.div 
              className="absolute bottom-10 flex gap-48"
              initial={{ x: "100%" }}
              animate={{ x: "-100%" }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-1.5 h-6 bg-slate-800 flex flex-col items-center justify-start">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]" />
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {/* Origin/Destination Labels */}
      <div className="relative z-10 flex justify-between items-center text-white/50 text-[10px] font-black uppercase tracking-wider">
        <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-white/5 backdrop-blur-sm max-w-[140px] truncate">{from}</span>
        <div className="flex-1 border-t border-dashed border-white/10 mx-4" />
        <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-white/5 backdrop-blur-sm max-w-[140px] truncate">{to}</span>
      </div>

      {/* Main Track and Vehicle Layer */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-3">
        {mode === "FLIGHT" && (
          <div className="relative w-full h-16">
            {/* Flight Path (contrail) */}
            <div className="absolute left-10 right-20 top-1/2 -translate-y-1/2 h-[1px] border-t border-dashed border-white/20" />
            
            {/* Aircraft movement */}
            <motion.div
              className="absolute left-[35%] top-[15%] text-white"
              animate={{
                y: [0, -12, 0, 8, 0],
                rotate: [0, -2, 4, -1, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 5,
                ease: "easeInOut"
              }}
            >
              <div className="relative flex items-center justify-center">
                <Plane className="h-8 w-8 text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.8)] fill-blue-500/10 -rotate-12" />
                {/* Engine fire glow */}
                <span className="absolute -left-1.5 top-5 h-1.5 w-1.5 bg-orange-500 rounded-full blur-[1px] animate-ping" />
              </div>
            </motion.div>
          </div>
        )}

        {mode === "TRAIN" && (
          <div className="relative w-full h-12 flex flex-col justify-end">
            {/* Train Tracks */}
            <div className="relative w-full h-1 bg-slate-700/80 mb-0.5">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-slate-500" />
              {/* Ties passing under */}
              <motion.div 
                className="absolute inset-0 flex justify-between"
                initial={{ x: 0 }}
                animate={{ x: -20 }}
                transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }}
              >
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="w-[2px] h-full bg-slate-800" />
                ))}
              </motion.div>
            </div>

            {/* Bullet train coach body */}
            <motion.div
              className="absolute left-[30%] bottom-1.5 flex items-end"
              animate={{
                y: [0, -1, 0.5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.15,
                ease: "linear"
              }}
            >
              <div className="flex items-end gap-[1px]">
                {/* Engine Car */}
                <div className="relative h-4.5 w-14 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-r-xl rounded-l-sm border-b border-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                  {/* Windows */}
                  <div className="absolute top-1 left-2 h-1.5 w-2 bg-slate-900 rounded-sm" />
                  <div className="absolute top-1 left-6 h-1 w-6 bg-slate-900 rounded-[1px] flex gap-[2px] p-[1px]">
                    <div className="w-1.5 h-full bg-cyan-400/80" />
                    <div className="w-1.5 h-full bg-cyan-400/80" />
                    <div className="w-1.5 h-full bg-cyan-400/80" />
                  </div>
                  {/* Under carriage wheel cover */}
                  <div className="absolute bottom-0 left-2 w-3 h-1 bg-slate-800 rounded-t-sm" />
                  <div className="absolute bottom-0 right-2 w-3 h-1 bg-slate-800 rounded-t-sm" />
                </div>
                {/* Passenger Car 1 */}
                <div className="h-4.5 w-10 bg-emerald-500 rounded-sm border-b border-emerald-600">
                  <div className="absolute top-1 flex gap-1 px-1">
                    <div className="w-1.5 h-1 bg-slate-900 rounded-[1px]" />
                    <div className="w-1.5 h-1 bg-slate-900 rounded-[1px]" />
                    <div className="w-1.5 h-1 bg-slate-900 rounded-[1px]" />
                  </div>
                  {/* Wheel covers */}
                  <div className="absolute bottom-0 left-1.5 w-2 h-[2px] bg-slate-800" />
                  <div className="absolute bottom-0 right-1.5 w-2 h-[2px] bg-slate-800" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {mode === "CAB" && (
          <div className="relative w-full h-12 flex flex-col justify-end">
            {/* The Winding Road with Milestones */}
            <div className="relative w-full h-4 bg-slate-900 border-t border-b border-slate-800 flex items-center">
              {/* Dotted lines sliding */}
              <motion.div 
                className="absolute inset-x-0 h-[1px] flex justify-between"
                initial={{ x: 0 }}
                animate={{ x: -24 }}
                transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="w-3 h-full bg-yellow-400/30" />
                ))}
              </motion.div>

              {/* Highway Milestones */}
              <div className="absolute inset-x-0 -top-6 flex justify-around px-8 text-[7.5px] font-black text-slate-400 uppercase tracking-tighter pointer-events-none">
                <div className="flex flex-col items-center">
                  <MapPin className="h-2.5 w-2.5 text-primary/60 mb-0.5" />
                  <span>Toll Plaza</span>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className="h-2.5 w-2.5 text-amber-500/60 mb-0.5" />
                  <span>Chai Stop</span>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className="h-2.5 w-2.5 text-cyan-400/60 mb-0.5" />
                  <span>Lookout</span>
                </div>
              </div>
            </div>

            {/* Cab cruising along road */}
            <motion.div
              className="absolute left-[38%] bottom-2 text-amber-400 flex items-end"
              animate={{
                y: [0, -2, 0.5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.2,
                ease: "easeInOut"
              }}
            >
              <div className="relative animate-pulse">
                <Car className="h-6 w-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] fill-slate-900" />
                {/* Spinning wheels */}
                <motion.div 
                  className="absolute bottom-0 left-[3px] w-1.5 h-1.5 rounded-full border border-slate-900 bg-slate-700" 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.2, ease: "linear" }}
                />
                <motion.div 
                  className="absolute bottom-0 right-[3px] w-1.5 h-1.5 rounded-full border border-slate-900 bg-slate-700"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.2, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>
        )}

        {mode === "BUS" && (
          <div className="relative w-full h-12 flex flex-col justify-end">
            {/* Road */}
            <div className="relative w-full h-4 bg-slate-900 border-t border-b border-slate-800 flex items-center">
              <motion.div 
                className="absolute inset-x-0 h-[1px] flex justify-between"
                initial={{ x: 0 }}
                animate={{ x: -30 }}
                transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }}
              >
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="w-5 h-full bg-slate-700/60" />
                ))}
              </motion.div>
            </div>

            {/* Bus rolling */}
            <motion.div
              className="absolute left-[35%] bottom-2 flex items-end"
              animate={{
                y: [0, -1.5, 1, -0.5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.35,
                ease: "easeInOut"
              }}
            >
              <div className="relative">
                <Bus className="h-7 w-7 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)] fill-slate-950" />
                {/* Wheels */}
                <motion.div 
                  className="absolute bottom-[1px] left-[4px] w-1.5 h-1.5 rounded-full border border-slate-950 bg-slate-800" 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }}
                />
                <motion.div 
                  className="absolute bottom-[1px] right-[4px] w-1.5 h-1.5 rounded-full border border-slate-950 bg-slate-800" 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Decorative footer progress indicators */}
      <div className="relative z-10 flex justify-between items-center text-[7.5px] font-black text-slate-500 uppercase tracking-tighter">
        <span>Departure Gate</span>
        <div className="flex-1 mx-4 h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden relative">
          <motion.div 
            className={`h-full rounded-full ${
              mode === "FLIGHT" ? "bg-blue-500 shadow-[0_0_8px_#3b82f6]" :
              mode === "TRAIN" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" :
              mode === "CAB" ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]" :
              "bg-indigo-400 shadow-[0_0_8px_#818cf8]"
            }`}
            initial={{ width: "10%" }}
            animate={{ width: "90%" }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 6, ease: "easeInOut" }}
          />
        </div>
        <span>Destination Exit</span>
      </div>
    </div>
  );
}

// ─── INTER-DESTINATION TRANSPORT MODAL ──────────────────────────────────────

interface InterDestinationTransportModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: any;
  tripId: string;
  dayNumber: string;
}

export function InterDestinationTransportModal({ isOpen, onClose, block, tripId, dayNumber }: InterDestinationTransportModalProps) {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<MarketplaceVehicle[]>([]);
  const [selectedTransit, setSelectedTransit] = useState<any | null>(null);
  const [activeVisualMode, setActiveVisualMode] = useState<"TRAIN" | "FLIGHT" | "CAB" | "BUS">("TRAIN");
  const [bookingForm, setBookingForm] = useState({
    name: "",
    date: "",
    seats: "1"
  });

  const isMeghalayaRoute = 
    (block?.from?.toLowerCase().includes("shillong") && block?.to?.toLowerCase().includes("cherrapunji")) ||
    (block?.from?.toLowerCase().includes("cherrapunji") && block?.to?.toLowerCase().includes("shillong"));

  useEffect(() => {
    if (isOpen) {
      loadMarketplace();
      setSelectedTransit(null);
      setActiveVisualMode(isMeghalayaRoute ? "BUS" : "TRAIN");
    }
  }, [isOpen, tripId, isMeghalayaRoute]);

  const loadMarketplace = async () => {
    try {
      setLoading(true);
      const data = await getTransportMarketplace(undefined, tripId);
      if (data && data.marketplace) {
        setVehicles(data.marketplace);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cabListing = vehicles.find(v => v.type === "CAB")?.listings?.[0];
  const carRentalListing = vehicles.find(v => v.type === "RENTAL_CAR")?.listings?.[0];
  const fallbackCabListingId = "l1";

  const handleBookTransit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransit) return;

    try {
      setLoading(true);
      const targetListingId = selectedTransit.listingId;
      await cartService.addToCart({
        tripId,
        type: "TRANSPORT",
        transportListingId: targetListingId,
        price: selectedTransit.price * parseInt(bookingForm.seats),
        transportDetails: {
          vehicleName: selectedTransit.name,
          providerName: selectedTransit.provider,
          phone: selectedTransit.phone,
          fromLocation: block.from || "A",
          toLocation: block.to || "B",
          departureDate: bookingForm.date,
          seats: bookingForm.seats,
          notes: `Inter-city transit: ${block.from} to ${block.to}`
        },
        scheduledDate: bookingForm.date ? new Date(bookingForm.date).toISOString() : new Date().toISOString()
      });

      toast.success(`${selectedTransit.name} ticket successfully booked & added to cart!`);
      setSelectedTransit(null);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to book transit option.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[3rem] bg-white gap-0 animate-in fade-in-50 duration-200">
        
        {/* Header Section */}
        <div className="p-8 bg-slate-900 text-white relative">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-primary hover:bg-primary text-white border-none font-black text-[10px] px-2.5 py-0.5 flex items-center gap-1">
              <Car className="h-3 w-3 fill-white" />
              INTER-CITY TRANSIT
            </Badge>
            {block.from && block.to && (
              <Badge variant="outline" className="border-white/20 text-white font-bold text-[10px] uppercase">
                {block.from} → {block.to}
              </Badge>
            )}
          </div>
          
          <h2 className="text-3xl font-black tracking-tight leading-tight mb-2 font-heading">
            Inter-City Travel Hub
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            Select your preferred inter-city transit option
          </p>
        </div>

        {/* Dynamic Interactive Scenic Animation Lane */}
        <div className="px-8 pt-6 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Travel Simulation View</span>
            <div className="flex bg-slate-200/60 p-0.5 rounded-xl border border-slate-300/40">
              {(["TRAIN", "FLIGHT", "CAB", "BUS"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setActiveVisualMode(m)}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                    activeVisualMode === m 
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <ScenicTravelVisualizer 
            from={block.from || "Point A"} 
            to={block.to || "Point B"} 
            mode={activeVisualMode} 
          />
        </div>

        {/* Body Section */}
        <div className="p-8 max-h-[48vh] overflow-y-auto bg-slate-50/50">
          
          {selectedTransit ? (
            /* Transit Booking Form */
            <motion.form 
              onSubmit={handleBookTransit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Selected Mode</span>
                  <h3 className="text-xl font-black text-slate-900">{selectedTransit.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedTransit.provider}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fare per Person</span>
                  <h3 className="text-2xl font-black text-primary italic">₹{selectedTransit.price}</h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lead Passenger Name</Label>
                  <Input 
                    required
                    value={bookingForm.name}
                    onChange={e => setBookingForm({...bookingForm, name: e.target.value})}
                    placeholder="Enter full name"
                    className="h-12 bg-white border-slate-200 rounded-2xl font-medium focus-visible:ring-primary/20 shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Departure Date</Label>
                    <Input 
                      required
                      type="date"
                      value={bookingForm.date}
                      onChange={e => setBookingForm({...bookingForm, date: e.target.value})}
                      className="h-12 bg-white border-slate-200 rounded-2xl font-medium shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Number of Seats</Label>
                    <Input 
                      required
                      type="number"
                      min="1"
                      value={bookingForm.seats}
                      onChange={e => setBookingForm({...bookingForm, seats: e.target.value})}
                      className="h-12 bg-white border-slate-200 rounded-2xl font-medium shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Total Price Due</span>
                  <div className="text-xl font-black text-slate-900">₹{selectedTransit.price * parseInt(bookingForm.seats || "1")}</div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                  <Shield className="h-3.5 w-3.5" /> SECURE BOOKING
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedTransit(null)}
                  className="flex-1 h-12 rounded-2xl font-bold uppercase text-xs"
                >
                  Back to Options
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book Seat & Add to Cart"}
                </Button>
              </div>
            </motion.form>
          ) : (
            /* Transit Options List */
            <div className="space-y-4">
              {isMeghalayaRoute ? (
                <>
                  {/* Option 1: MTC Government Bus */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 hover:shadow-xl hover:border-indigo-400/40 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-400/5 rounded-full blur-2xl group-hover:bg-indigo-400/10 transition-colors" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                          <Bus className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-base text-slate-900">MTC Government Bus</h4>
                            <Badge className="bg-indigo-50 text-indigo-700 font-bold border-none text-[8px] px-2 py-0.2">GOVERNMENT BUS</Badge>
                          </div>
                          <p className="text-slate-400 text-[11px] font-medium leading-relaxed max-w-sm">
                            Official Meghalaya Transport Corporation daily bus. Reliable, direct public transit between Shillong and Cherrapunji.
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-bold">
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-indigo-500" /> ~2h 15m</span>
                            <span className="flex items-center gap-1"><Coins className="h-3.5 w-3.5 text-indigo-500" /> ₹80</span>
                          </div>
                        </div>
                      </div>
                      <a 
                        href="https://www.google.com/maps/search/?api=1&query=MTC+Bus+Stand+Police+Bazar+Shillong"
                        target="_blank"
                        rel="noreferrer"
                        className="h-10 px-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-500/15 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Boarding Point
                      </a>
                    </div>
                  </div>

                  {/* Option 2: Shared Tata Sumo Shuttle */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 hover:shadow-xl hover:border-amber-400/40 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-amber-400/5 rounded-full blur-2xl group-hover:bg-amber-400/10 transition-colors" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-base text-slate-900">Shared Sumo Shuttle</h4>
                            <Badge className="bg-amber-50 text-amber-700 font-bold border-none text-[8px] px-2 py-0.2">HIGH FREQUENCY TRANSIT</Badge>
                          </div>
                          <p className="text-slate-400 text-[11px] font-medium leading-relaxed max-w-sm">
                            Classic Meghalaya shared Tata Sumo. Runs directly from Bara Bazar to Cherrapunji Sumo Stand. Authentic hill travel experience.
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-bold">
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-amber-500" /> ~1h 45m</span>
                            <span className="flex items-center gap-1"><Coins className="h-3.5 w-3.5 text-amber-500" /> ₹150</span>
                          </div>
                        </div>
                      </div>
                      <a 
                        href="https://www.google.com/maps/search/?api=1&query=Bara+Bazar+Sumo+Stand+Shillong"
                        target="_blank"
                        rel="noreferrer"
                        className="h-10 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-amber-500/15 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Boarding Point
                      </a>
                    </div>
                  </div>

                  {/* Option 3: Private Tourist Taxi */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 hover:shadow-xl hover:border-primary/40 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Car className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-base text-slate-900">Private Hill Taxi</h4>
                            <Badge className="bg-primary/10 text-primary border-none text-[8px] font-bold px-2 py-0.2">FLEXIBLE SIGHTSEEING</Badge>
                          </div>
                          <p className="text-slate-400 text-[11px] font-medium leading-relaxed max-w-sm">
                            Private Alto/Swift cab. Fast hill driving, direct door-to-door drop, options to pause for scenic viewpoint photos.
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-bold">
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> ~1h 30m</span>
                            <span className="flex items-center gap-1"><Coins className="h-3.5 w-3.5 text-primary" /> ₹2,000 (Full Cab)</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        type="button"
                        onClick={() => {
                          setSelectedTransit({
                            name: "Private Meghalaya Hill Taxi (Alto/Swift)",
                            provider: "Shillong Tourist Taxi Association",
                            phone: "+91 98630 12345",
                            price: 2000,
                            listingId: cabListing?.id || fallbackCabListingId
                          });
                          setActiveVisualMode("CAB");
                        }}
                        className="h-10 px-5 bg-primary hover:bg-primary/95 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-primary/15"
                      >
                        Select Cab
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Option 1: Vande Bharat Rail */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 hover:shadow-xl hover:border-emerald-400/40 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-400/5 rounded-full blur-2xl group-hover:bg-emerald-400/10 transition-colors" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                          <Train className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-base text-slate-900">Vande Bharat Express</h4>
                            <Badge className="bg-emerald-50 text-emerald-700 font-bold border-none text-[8px] px-2 py-0.2">HIGH SPEED RAIL</Badge>
                          </div>
                          <p className="text-slate-400 text-[11px] font-medium leading-relaxed max-w-sm">
                            Ultra-premium AC Chair Car. High speed comfort, catering included, eco-friendly.
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-bold">
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-emerald-500" /> ~4h 30m</span>
                            <span className="flex items-center gap-1"><Coins className="h-3.5 w-3.5 text-emerald-500" /> ₹1,200</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        type="button"
                        onClick={() => {
                          setSelectedTransit({
                            name: "Vande Bharat Express AC Chair Car",
                            provider: "Indian Railways IRCTC",
                            phone: "139",
                            price: 1200,
                            listingId: cabListing?.id || fallbackCabListingId
                          });
                          setActiveVisualMode("TRAIN");
                        }}
                        className="h-10 px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-500/15"
                      >
                        Book Ticket
                      </Button>
                    </div>
                  </div>

                  {/* Option 2: Direct Flight */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 hover:shadow-xl hover:border-blue-400/40 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-blue-400/5 rounded-full blur-2xl group-hover:bg-blue-400/10 transition-colors" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                          <Plane className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-base text-slate-900">Direct Flight</h4>
                            <Badge className="bg-blue-50 text-blue-700 font-bold border-none text-[8px] px-2 py-0.2">FASTEST MODE</Badge>
                          </div>
                          <p className="text-slate-400 text-[11px] font-medium leading-relaxed max-w-sm">
                            Indiglow Wings Premium Economy. Perfect for saving travel days across major distances.
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-bold">
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-blue-500" /> ~1h 15m</span>
                            <span className="flex items-center gap-1"><Coins className="h-3.5 w-3.5 text-blue-500" /> ₹3,499</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        type="button"
                        onClick={() => {
                          setSelectedTransit({
                            name: "Direct Flight (IndiGlow Wings)",
                            provider: "IndiGlow Airways Ltd.",
                            phone: "+91 99999 88888",
                            price: 3499,
                            listingId: cabListing?.id || fallbackCabListingId
                          });
                          setActiveVisualMode("FLIGHT");
                        }}
                        className="h-10 px-5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-blue-500/15"
                      >
                        Book Seat
                      </Button>
                    </div>
                  </div>

                  {/* Option 3: Private Intercity Cab */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 hover:shadow-xl hover:border-primary/40 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Car className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-base text-slate-900">Private Intercity Cab</h4>
                            <Badge className="bg-primary/10 text-primary border-none text-[8px] font-bold px-2 py-0.2">DOOR-TO-DOOR CRUISER</Badge>
                          </div>
                          <p className="text-slate-400 text-[11px] font-medium leading-relaxed max-w-sm">
                            Premium AC SUV or Sedan with experienced inter-city chauffeur. Stop for sightseeing along the way!
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-bold">
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> ~5h 15m</span>
                            <span className="flex items-center gap-1"><Coins className="h-3.5 w-3.5 text-primary" /> ₹3,999 (Full Vehicle)</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        type="button"
                        onClick={() => {
                          setSelectedTransit({
                            name: vehicles.find(v => v.type === "RENTAL_CAR")?.name || "Premium AC Sedan Cruiser",
                            provider: carRentalListing?.provider?.name || "Royal Brothers Cabs",
                            phone: carRentalListing?.provider?.phone || "+91 98765 43210",
                            price: carRentalListing?.price || 3999,
                            listingId: carRentalListing?.id || fallbackCabListingId
                          });
                          setActiveVisualMode("CAB");
                        }}
                        className="h-10 px-5 bg-primary hover:bg-primary/95 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-primary/15"
                      >
                        Select Cab
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── INTERACTIVE PUBLIC TRANSPORT MODAL (GUIDE TO SPOT) ──────────────────────

interface PublicTransportModalProps {
  isOpen: boolean;
  onClose: () => void;
  block: any;
}

export function PublicTransportModal({ isOpen, onClose, block }: PublicTransportModalProps) {
  const spotName = block?.name || "the Travel Spot";
  const transportData = getPublicTransportOptions(spotName);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-slate-50/90 gap-0 backdrop-blur-xl">
        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative border-b border-white/5">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all z-10 border border-white/10"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[9px] px-2.5 py-0.5 flex items-center gap-1.5 uppercase tracking-wider">
              <Compass className="h-3 w-3 animate-spin animate-spin-slow" />
              Live Transit Network
            </Badge>
          </div>

          <h2 className="text-2xl font-black tracking-tight leading-none mb-1 font-heading bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Public Transit Simplified
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Essential public transport options to reach <span className="text-emerald-400 font-bold">{spotName}</span>
          </p>
        </div>

        {/* Options Grid */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transportData.options.map((option) => {
              const isBus = option.type === "BUS";
              return (
                <motion.div
                  key={option.type}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative overflow-hidden bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:border-emerald-500/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${
                          isBus 
                            ? "bg-indigo-50 text-indigo-600 border border-indigo-100/60" 
                            : "bg-amber-50 text-amber-600 border border-amber-100/60"
                        }`}>
                          {isBus ? <Bus className="h-5.5 w-5.5" /> : <Car className="h-5.5 w-5.5" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-800 leading-tight">
                            {option.title}
                          </h3>
                          <span className={`text-[8.5px] font-black uppercase tracking-wider ${
                            isBus ? "text-indigo-600" : "text-amber-600"
                          }`}>
                            {isBus ? "City Bus Service" : "Shared Commuter Cab"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-4">
                      {/* Pickup Point */}
                      <div className="flex items-start gap-3 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                        <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider leading-none mb-1">Pickup Point</p>
                          <p className="text-xs font-bold text-slate-700 leading-tight">{option.pickupPoint}</p>
                        </div>
                      </div>

                      {/* Fare */}
                      <div className="flex items-start gap-3 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                        <Coins className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider leading-none mb-1">Fare</p>
                          <p className="text-xs font-black text-slate-850 font-mono italic leading-none">{option.fare}</p>
                        </div>
                      </div>

                      {/* Timing */}
                      <div className="flex items-start gap-3 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                        <Clock className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider leading-none mb-1">Timing & Frequency</p>
                          <p className="text-xs font-bold text-slate-700 leading-tight">{option.timing}</p>
                        </div>
                      </div>

                      {/* Step-by-Step Route Guide */}
                      <div className="mt-5 pt-4 border-t border-slate-100/80">
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider leading-none mb-3">
                          Step-by-Step Route Guide
                        </p>
                        <div className="space-y-3.5 relative pl-4 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-100">
                          {option.guideSteps.map((step, sIdx) => (
                            <div key={sIdx} className="relative flex items-start gap-2">
                              <div className={`absolute -left-[15px] mt-1 h-2 w-2 rounded-full border ${
                                isBus ? "bg-indigo-500 border-indigo-100" : "bg-amber-500 border-amber-100"
                              } ring-4 ring-white z-10`} />
                              <span className="text-[11px] font-semibold text-slate-600 leading-normal">
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
