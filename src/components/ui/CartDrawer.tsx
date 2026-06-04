"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, Trash2, Mountain, Car, CreditCard, Plus, Minus } from "lucide-react";
import { cartService, CartItem } from "@/services/cart.service";
import { tripService } from "@/services/trip.service";
import { toast } from "sonner";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await cartService.getCart();
      setItems(res.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  useEffect(() => {
    loadCart();
  }, [pathname]);

  const handleRemove = async (id: string) => {
    try {
      await cartService.removeFromCart(id);
      setItems(items.filter(i => i.id !== id));
      toast.success("Item removed from cart");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await cartService.updateCartItem(id, { numberOfPersons: newQuantity });
      setItems(items.map(i => i.id === id ? { ...i, numberOfPersons: newQuantity } : i));
      loadCart(); // Refresh to get correct price from backend
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (tripId: string) => {
    try {
      setIsCheckingOut(tripId);
      
      const res = await loadRazorpay();
      if (!res) {
        toast.error("Razorpay SDK failed to load.");
        return;
      }

      const targetTripId = tripId === 'unassigned' ? '' : tripId;
      const checkoutData = await cartService.checkout(targetTripId);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_fLjLz0BJbniTcg',
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        name: 'Travenic',
        description: 'Trip Booking Payment',
        order_id: checkoutData.orderId,
        handler: async function (response: any) {
          try {
            await cartService.verifyPayment(targetTripId, response);
            toast.success("Payment Successful! Bookings Confirmed.");
            setIsOpen(false);
            router.push('/dashboard/bookings');
          } catch (err) {
            toast.error("Payment verification failed.");
          }
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      toast.error(error.response?.data?.error || "Checkout failed");
    } finally {
      setIsCheckingOut(null);
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    const tripId = item.tripId || 'unassigned';
    if (!acc[tripId]) acc[tripId] = [];
    acc[tripId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger 
        render={
          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
            <ShoppingCart className="h-5 w-5" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-black text-white flex items-center justify-center shadow-lg">
                {items.length}
              </span>
            )}
          </Button>
        }
      />
      
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 p-0 border-l border-slate-200">
        <SheetHeader className="p-6 bg-white border-b border-slate-100">
          <SheetTitle className="flex items-center gap-2 font-black text-2xl tracking-tight">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        <div className="p-6">
          {loading && items.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-lg text-slate-700">Your cart is empty</h3>
              <p className="text-sm text-slate-500 mt-2">Add activities and transport to book your perfect trip.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedItems).map(([tripId, tripItems]) => {
                const tripTitle = tripItems[0]?.trip?.title || "General Bookings";
                const tripTotal = tripItems.reduce((sum, i) => sum + i.price, 0);

                return (
                  <div key={tripId} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight italic">{tripTitle}</h4>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-bold text-[9px] uppercase">
                        {tripItems.length} Items
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {tripItems.map(item => (
                        <div key={item.id} className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-slate-100/50 transition-colors group">
                          <div className="h-20 w-20 bg-white rounded-xl overflow-hidden relative shrink-0 flex items-center justify-center shadow-sm border border-slate-200">
                            {item.type === 'ACTIVITY' && item.activity?.imageUrl ? (
                              <Image src={item.activity.imageUrl} alt="" fill className="object-cover" />
                            ) : item.type === 'TRANSPORT' ? (
                              <Car className="h-8 w-8 text-slate-300" />
                            ) : (
                              <Mountain className="h-8 w-8 text-slate-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 py-1">
                            <h5 className="font-bold text-sm text-slate-900 truncate">
                              {item.type === 'ACTIVITY' ? item.activity?.name : item.transportListing?.vehicleModel?.name}
                            </h5>
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-0.5">
                              {item.type}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-2">
                               <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-7">
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.id, item.numberOfPersons - 1)}
                                    className="px-2 hover:bg-slate-50 text-slate-500 transition-colors"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="text-[10px] font-black w-6 text-center text-slate-900">{item.numberOfPersons}</span>
                                  <button 
                                    onClick={() => handleUpdateQuantity(item.id, item.numberOfPersons + 1)}
                                    className="px-2 hover:bg-slate-50 text-slate-500 transition-colors"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                               </div>
                               <p className="font-black text-primary ml-auto text-sm">₹{item.price.toLocaleString()}</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl h-8 w-8 self-start opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemove(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between px-2">
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Payable Amount</p>
                        <p className="font-black text-xl text-slate-900">₹{tripTotal.toLocaleString()}</p>
                      </div>
                      
                      <Button
                        onClick={() => handleCheckout(tripId)}
                        disabled={isCheckingOut === tripId}
                        className="rounded-2xl bg-black text-white font-black text-xs uppercase tracking-widest px-6 h-12 shadow-lg hover:shadow-xl transition-all"
                      >
                        {isCheckingOut === tripId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Checkout Now"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
