"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  Bike, 
  Star, 
  Zap,
  ChevronDown,
  ChevronUp,
  Loader2,
  Smartphone,
  Phone,
  CreditCard,
  ShoppingCart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getTransportMarketplace, MarketplaceVehicle, createTransportOrder, verifyTransportPayment } from "@/services/features.service";
import { cartService } from "@/services/cart.service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface TransportSelection {
  listingId: string;
  vehicleName: string;
  providerName: string;
  price: number;
  phone: string;
  type: string;
}

interface TransportMarketplaceProps {
  tripId: string;
  onSelect: (selection: TransportSelection) => void;
}

import { BookingDetailsModal } from "../itinerary/BookingDetailsModal";

export function TransportMarketplace({ tripId, onSelect }: TransportMarketplaceProps) {
  const [vehicles, setVehicles] = useState<MarketplaceVehicle[]>([]);
  const [pickupPoints, setPickupPoints] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'CAB' | 'RENTAL_BIKE' | 'RENTAL_CAR'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState<string | null>(null);
  const [bookingModal, setBookingModal] = useState<{ isOpen: boolean; vehicle: MarketplaceVehicle | null; listing: any | null }>({
    isOpen: false,
    vehicle: null,
    listing: null
  });

  useEffect(() => {
    loadMarketplace();
  }, [filter]);

  const loadMarketplace = async () => {
    try {
      setLoading(true);
      const data = await getTransportMarketplace(filter === 'ALL' ? undefined : filter, tripId);
      setVehicles(data.marketplace);
      setPickupPoints(data.pickupPoints);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateBooking = (vehicle: MarketplaceVehicle, listing: any) => {
    setBookingModal({
      isOpen: true,
      vehicle,
      listing
    });
  };

  const handleConfirmBooking = async (details: any) => {
    const { vehicle, listing } = bookingModal;
    if (!vehicle || !listing) return;

    setBookingModal({ ...bookingModal, isOpen: false });
    setIsPaying(listing.id);
    
    try {
      await cartService.addToCart({
        tripId,
        type: 'TRANSPORT',
        transportListingId: listing.id,
        price: details.totalAmount || listing.price,
        transportDetails: details,
        scheduledDate: details.startDate // Using startDate as scheduledDate for transport
      });

      toast.success("Added to cart! You can checkout from the cart drawer.");
      onSelect({
        listingId: listing.id,
        vehicleName: vehicle.name,
        providerName: listing.provider.name,
        price: listing.price,
        phone: listing.provider.phone,
        type: vehicle.type
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add to cart.");
    } finally {
      setIsPaying(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'RENTAL_BIKE': return <Bike className="h-4 w-4" />;
      case 'RENTAL_CAR': return <Car className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Marketplace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BookingDetailsModal 
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ ...bookingModal, isOpen: false })}
        onConfirm={handleConfirmBooking}
        vehicleName={bookingModal.vehicle?.name || ""}
        price={bookingModal.listing?.price || 0}
        pickupPoints={pickupPoints}
      />
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {(['ALL', 'CAB', 'RENTAL_BIKE', 'RENTAL_CAR'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              filter === f ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {vehicles.map((vehicle, idx) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="overflow-hidden border-none ring-1 ring-border/50 group bg-background/40 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-48 h-40 relative overflow-hidden shrink-0">
                  <Image 
                    src={vehicle.imageUrl || "https://images.unsplash.com/photo-1549194388-f61be84a6e9e?w=400&q=80"} 
                    alt={vehicle.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-2 left-2">
                     <Badge className="bg-primary/90 text-white border-none text-[9px] font-bold uppercase py-0.5 px-2 flex items-center gap-1">
                       {getIcon(vehicle.type)} {vehicle.type.replace('RENTAL_', '')}
                     </Badge>
                  </div>
                </div>
                
                <div className="flex-1 p-5 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-black text-lg tracking-tight">{vehicle.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{vehicle.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Starts at</div>
                      <div className="text-xl font-black text-primary">₹{vehicle.startingPrice}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {vehicle.listings.slice(0, 3).map((l, i) => (
                          <div key={i} className="h-7 w-7 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[8px] font-black text-primary">
                            {l.provider.name.charAt(0)}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">Available from {vehicle.vendorCount} vendors</span>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 h-8 px-3 rounded-lg"
                      onClick={() => setExpandedId(expandedId === vehicle.id ? null : vehicle.id)}
                    >
                      {expandedId === vehicle.id ? "Hide Sellers" : "Compare Sellers"}
                      {expandedId === vehicle.id ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                    </Button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === vehicle.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-muted/20 border-t border-border/30"
                  >
                    <div className="p-4 space-y-3">
                      {vehicle.listings.map((listing) => (
                        <div key={listing.id} className="flex items-center justify-between p-3 rounded-xl bg-background/60 border border-border/50 hover:border-primary/30 transition-all group/listing">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                               {listing.provider.name.charAt(0)}
                             </div>
                             <div>
                               <div className="flex items-center gap-2">
                                 <h5 className="text-sm font-black tracking-tight">{listing.provider.name}</h5>
                                 <Badge variant="outline" className="text-[8px] h-4 font-bold border-amber-500/50 text-amber-600 bg-amber-500/5 flex items-center gap-0.5">
                                   <Star className="h-2 w-2 fill-amber-500" /> {listing.provider.rating}
                                 </Badge>
                               </div>
                               <button 
                                 onClick={() => window.open(`tel:${listing.provider.phone}`)}
                                 className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                               >
                                 <Phone className="h-3 w-3" /> {listing.provider.phone}
                               </button>
                             </div>
                          </div>

                          <div className="flex items-center gap-6">
                             <div className="text-right">
                               <div className="text-sm font-black text-primary">₹{listing.price}</div>
                               <div className="text-[9px] font-bold text-muted-foreground uppercase">per day</div>
                             </div>
                             <Button 
                               size="sm" 
                               disabled={!!isPaying}
                               className="rounded-lg h-10 px-4 text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/10 gap-2"
                               onClick={() => handleInitiateBooking(vehicle, listing)}
                             >
                               {isPaying === listing.id ? (
                                 <Loader2 className="h-3 w-3 animate-spin" />
                               ) : (
                                 <ShoppingCart className="h-3 w-3" />
                               )}
                               Add to Cart
                             </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
