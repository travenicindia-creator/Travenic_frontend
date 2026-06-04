"use client";

import React, { useEffect, useState } from "react";
import { bookingService, Booking } from "@/services/booking.service";
import { Loader2, Ticket, MapPin, Calendar, CreditCard, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function BookingsClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.getUserBookings()
      .then((data) => setBookings(data.bookings || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
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

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-indigo-600 px-6 pt-12 pb-24 rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-600 via-indigo-600/80 to-transparent"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto flex items-center gap-4">
          <div className="h-16 w-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
            <Ticket className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-heading tracking-tight text-white">My Bookings</h1>
            <p className="text-indigo-100 font-medium">Manage your purchased experiences & tickets</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-12 relative z-20">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-slate-100">
            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No bookings found</h3>
            <p className="text-slate-500">You haven't booked any activities yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 group hover:shadow-xl transition-all duration-300"
              >
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  {booking.activity?.imageUrl ? (
                    <Image
                      src={booking.activity.imageUrl}
                      alt={booking.activity.name || "Activity"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : booking.type === 'TRANSPORT' ? (
                    <div className="h-full w-full flex items-center justify-center bg-indigo-50">
                      <MapPin className="h-12 w-12 text-indigo-300" />
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Ticket className="h-12 w-12 text-slate-200" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  <div className="absolute top-4 left-4">
                    <Badge className="px-3 py-1 bg-white/90 text-slate-900 border-none shadow-sm backdrop-blur-sm">
                      {booking.type === 'TRANSPORT' ? 'Transport' : 'Activity'}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <Badge className={`px-3 py-1 font-bold ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </Badge>
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl text-xs font-black text-slate-900 shadow-sm">
                      ₹{booking.totalAmount}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-black text-slate-800 mb-4 line-clamp-1">
                    {booking.activity?.name || booking.tripTransport?.listing?.vehicleModel?.name || "Unknown Experience"}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      <span>{format(new Date(booking.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <CreditCard className="h-4 w-4 text-emerald-500" />
                      <span>{booking.type === 'TRANSPORT' ? 'Vehicle Booking' : `${booking.numberOfPersons} Tickets`}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <MapPin className="h-4 w-4 text-rose-500" />
                      <span>ID: {booking.id.split('-')[0].toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                    <Link href={`/dashboard/bookings/${booking.id}`} className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
