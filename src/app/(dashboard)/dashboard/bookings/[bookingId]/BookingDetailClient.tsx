"use client";

import React, { useEffect, useState } from "react";
import { bookingService, Booking } from "@/services/booking.service";
import { Loader2, ArrowLeft, Calendar, Users, IndianRupee, CheckCircle2, Ticket, Clock, Download, Bed, Utensils, Star, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import QRCode from "react-qr-code";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function BookingDetailClient({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for suggestions
  const staySuggestions = [
    {
      id: 1,
      name: "Heritage Boutique Stay",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800",
      rating: 4.8,
      price: "₹3,500",
      location: "0.5 km away"
    },
    {
      id: 2,
      name: "Mountain View Villa",
      image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=800",
      rating: 4.9,
      price: "₹5,200",
      location: "1.2 km away"
    }
  ];

  const foodSuggestions = [
    {
      id: 1,
      name: "The Local Nomad Café",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800",
      rating: 4.7,
      type: "Café & Bakery",
      location: "300m away"
    },
    {
      id: 2,
      name: "Spices of India",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800",
      rating: 4.6,
      type: "Fine Dining",
      location: "0.8 km away"
    }
  ];

  useEffect(() => {
    bookingService.getBooking(bookingId)
      .then((data) => setBooking(data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load booking details"))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50 p-6 text-center">
        <Ticket className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Not Found</h2>
        <p className="text-slate-500 mb-6">{error || "We couldn't find the ticket you're looking for."}</p>
        <Link href="/dashboard/bookings" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          Back to Bookings
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      case 'REFUNDED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'REFUND_FAILED': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const isConfirmed = booking.status === 'PAID' || booking.status === 'CONFIRMED';
  const destinationName = booking.trip?.destination?.name || "the area";

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-indigo-600 px-6 pt-8 pb-32 rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-600 via-indigo-600/80 to-transparent"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <Link href="/dashboard/bookings" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to Bookings
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black font-heading tracking-tight text-white mb-2">Ticket Details</h1>
              <div className="flex items-center gap-2 text-indigo-100">
                <span className="font-mono text-sm">#{booking.id.slice(-8).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Card */}
      <div className="max-w-2xl mx-auto px-6 -mt-20 relative z-20">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row relative"
        >
          {/* Perforation line */}
          <div className="hidden md:flex absolute left-2/3 top-0 bottom-0 w-px border-l-2 border-dashed border-slate-200 -ml-px z-10"></div>
          <div className="md:hidden absolute top-[55%] left-0 right-0 h-px border-t-2 border-dashed border-slate-200 z-10"></div>

          {/* Left Side: Activity Info */}
          <div className="flex-1 p-8 md:p-10 relative">
            <div className="flex items-center justify-between mb-6">
              <Badge className={`px-3 py-1 font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                {booking.status}
              </Badge>
              {isConfirmed && (
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full">
                  <CheckCircle2 className="h-4 w-4" />
                  Verified
                </div>
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-2 font-heading leading-tight">
              {booking.activity?.name || booking.tripTransport?.listing?.vehicleModel?.name || "Unknown Experience"}
            </h2>
            <p className="text-slate-500 mb-8 flex items-center gap-1.5 font-medium">
              {booking.type === 'TRANSPORT' ? <MapPin className="h-4 w-4 text-indigo-500" /> : <Ticket className="h-4 w-4 text-indigo-500" />} 
              {booking.type === 'TRANSPORT' ? 'Transport Rental' : 'Travenic Exclusive'}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date</p>
                <p className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {booking.type === 'TRANSPORT' ? 'Rental Details' : 'Travelers'}
                </p>
                <p className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                  {booking.type === 'TRANSPORT' ? (
                    <>
                      <Clock className="h-4 w-4 text-emerald-500" />
                      {booking.tripTransport?.rentalType || 'Vehicle Rental'}
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 text-emerald-500" />
                      {booking.numberOfPersons} Nomad(s)
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Paid</p>
                <p className="text-2xl font-black text-slate-900 flex items-center">
                  <IndianRupee className="h-5 w-5" />
                  {booking.totalAmount}
                </p>
              </div>
              <button 
                onClick={async () => {
                  try {
                    const ref = booking.bookingRef || booking.id.slice(-8).toUpperCase();
                    await bookingService.downloadBookingPDF(booking.id, ref);
                  } catch (err) {
                    console.error("Download failed:", err);
                  }
                }}
                className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>

            {/* Refund & Cancellation Status */}
            {(booking.status === 'CANCELLED' || booking.status.startsWith('REFUND')) && (
              <div className="mt-6 bg-red-50 rounded-2xl p-5 border border-red-100">
                <h4 className="text-sm font-black text-red-800 mb-2">Cancellation Details</h4>
                {booking.refundAmount !== undefined && booking.refundAmount > 0 ? (
                  <>
                    <p className="text-sm text-red-700 mb-1">
                      Refund Amount: <span className="font-bold">₹{booking.refundAmount}</span>
                    </p>
                    <p className="text-xs text-red-600">
                      Refund Status: <span className="font-bold">{booking.status}</span>
                    </p>
                    {booking.refundId && (
                      <p className="text-xs text-red-500 mt-1 font-mono">Ref ID: {booking.refundId}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-red-700">This booking was cancelled with no refund according to the policy.</p>
                )}
              </div>
            )}

            {booking.status !== 'CANCELLED' && !booking.status.startsWith('REFUND') && (
              <button
                onClick={async () => {
                  if (window.confirm("Are you sure you want to cancel this booking?")) {
                    try {
                      await bookingService.cancelBooking(booking.id);
                      toast.success("Booking cancelled successfully");
                      window.location.reload();
                    } catch (err) {
                      toast.error("Failed to cancel booking");
                    }
                  }
                }}
                className="mt-6 w-full py-3 rounded-xl border border-red-100 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-colors"
              >
                Cancel Booking
              </button>
            )}
          </div>

          {/* Right Side: QR Code */}
          <div className="md:w-1/3 bg-white p-8 md:p-10 flex flex-col items-center justify-center relative">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 text-center">
              Scan to Enter
            </p>
            
            <div className={`p-4 bg-white rounded-2xl shadow-sm border ${isConfirmed ? 'border-emerald-200' : 'border-slate-200'}`}>
              <QRCode 
                value={booking.id} 
                size={140}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                fgColor={isConfirmed ? "#0f172a" : "#cbd5e1"}
              />
            </div>

            {isConfirmed ? (
              <div className="mt-6 flex flex-col items-center gap-1">
                <p className="text-xs font-black text-slate-800 tracking-widest uppercase">Valid Ticket</p>
                <p className="text-[10px] text-slate-400">Scan at the venue entrance</p>
              </div>
            ) : (
              <p className="text-[10px] font-bold text-amber-600 mt-6 text-center bg-amber-50 px-3 py-2 rounded-xl border border-amber-100">
                Awaiting Confirmation
              </p>
            )}
          </div>
        </motion.div>

        {/* Cancellation Policy Section */}
        {booking.cancellationPolicy && booking.cancellationPolicy.length > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto mt-8 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
          >
            <h3 className="text-xl font-black text-slate-800 mb-4">Cancellation Policy</h3>
            <div className="space-y-3">
              {booking.cancellationPolicy.map((policy, idx) => (
                <div key={idx} className={`flex justify-between items-center p-3 rounded-xl text-sm ${policy.highlight ? 'bg-indigo-50 border border-indigo-100 text-indigo-800 font-bold' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                  <span>{policy.window}</span>
                  <span>{policy.refund}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Suggestions Section */}
        <div className="mt-16 space-y-12">
          {/* Stay Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6 px-2">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Bed className="h-5 w-5 text-indigo-500" />
                  Recommended Stays
                </h3>
                <p className="text-sm text-slate-500 font-medium">Top picks in {destinationName}</p>
              </div>
              <button className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {staySuggestions.map((stay) => (
                <div key={stay.id} className="bg-white rounded-[2rem] p-3 border border-slate-100 shadow-lg shadow-slate-200/50 group cursor-pointer hover:shadow-xl transition-all">
                  <div className="relative h-40 rounded-[1.5rem] overflow-hidden mb-4">
                    <Image src={stay.image} alt={stay.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-black">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      {stay.rating}
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <h4 className="font-bold text-slate-800 mb-1">{stay.name}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <MapPin className="h-3 w-3 text-rose-500" />
                        {stay.location}
                      </div>
                      <span className="text-sm font-black text-indigo-600">{stay.price}<span className="text-[10px] text-slate-400">/night</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Food Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6 px-2">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-emerald-500" />
                  Local Flavors
                </h3>
                <p className="text-sm text-slate-500 font-medium">Best food spots in {destinationName}</p>
              </div>
              <button className="text-sm font-bold text-emerald-600 hover:underline">View All</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {foodSuggestions.map((food) => (
                <div key={food.id} className="bg-white rounded-[2rem] p-3 border border-slate-100 shadow-lg shadow-slate-200/50 group cursor-pointer hover:shadow-xl transition-all">
                  <div className="relative h-40 rounded-[1.5rem] overflow-hidden mb-4">
                    <Image src={food.image} alt={food.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-black">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      {food.rating}
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <h4 className="font-bold text-slate-800 mb-1">{food.name}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <MapPin className="h-3 w-3 text-rose-500" />
                        {food.location}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{food.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
