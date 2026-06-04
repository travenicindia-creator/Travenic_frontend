'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, MapPin, Users, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bookingService } from '@/services/booking.service';
import Link from 'next/link';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingService.getBooking(params.bookingId as string);
        setBooking(res.booking);
      } catch (err) {
        console.error('Error fetching booking:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [params.bookingId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Booking Not Found</h1>
        <p className="text-slate-500 mb-8">We couldn't find the booking details you're looking for.</p>
        <Button onClick={() => router.push('/dashboard/activities')}>Return to Activities</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-emerald-100 mb-8">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>
        
        <h1 className="text-4xl font-black font-heading tracking-tight italic text-slate-900 mb-2">
          BOOKING CONFIRMED!
        </h1>
        <p className="text-slate-500 text-lg mb-12">
          Your adventure has been locked in. Get ready for an unforgettable quest.
        </p>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden mb-12 text-left">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1 block">Activity Detail</span>
                <h2 className="text-2xl font-bold text-slate-900">{booking.activity?.title || 'Expedition'}</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Booking ID</span>
                <span className="font-mono text-sm font-bold text-slate-600">#{booking.id.slice(-8).toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Date</span>
                  <span className="text-slate-700 font-semibold">To be scheduled with guide</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Travelers</span>
                  <span className="text-slate-700 font-semibold">{booking.numberOfPersons} Nomad(s)</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Location</span>
                  <span className="text-slate-700 font-semibold">Meghalaya, India</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Status</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider italic">
                    {booking.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-slate-500 font-medium">Paid</span>
                  <span className="text-slate-900 font-bold">₹{booking.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard/activities">
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-2xl group text-sm font-bold tracking-tight">
              Book Another Quest
            </Button>
          </Link>
          <Link href="/dashboard/trips">
            <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 rounded-2xl text-sm font-bold tracking-tight group">
              View Itinerary
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
