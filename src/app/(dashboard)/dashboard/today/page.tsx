"use client";

import { useState, useEffect } from "react";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  MapPin, 
  Car, 
  Sparkles, 
  CloudSun, 
  Waves,
  Navigation,
  MessageSquare,
  ArrowRight,
  Sun,
  Coffee,
  Loader2,
  AlertCircle,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { itineraryService } from "@/services/itinerary.service";
import Link from "next/link";

interface TimelineItem {
    id: string;
    time: string;
    endTime: string;
    title: string;
    description: string;
    image?: string;
    type: 'spot' | 'activity';
    isUpcoming: boolean;
}

interface TodayData {
    trip: { id: string, title: string, destination: string } | null;
    day: { id: string, number: number, date: string } | null;
    timeline: TimelineItem[];
    upcoming: TimelineItem[];
    message?: string;
}

export default function TodaySchedulePage() {
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodayData = async () => {
      try {
        const result = await itineraryService.getTodayTimeline();
        setData(result);
      } catch (err: any) {
        setError(err.message || "Failed to load today's schedule.");
      } finally {
        setLoading(false);
      }
    };
    fetchTodayData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (!data?.trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <Calendar className="h-12 w-12 text-muted-foreground opacity-20" />
        </div>
        <h2 className="text-3xl font-black font-heading tracking-tight italic mb-2">No Active Journey</h2>
        <p className="text-muted-foreground max-w-md mb-8">
            You don't have any trips active today. Start a new journey or check your upcoming adventures in the trips section.
        </p>
        <div className="flex gap-4">
            <Link href="/dashboard/create">
                <Button className="h-12 px-8 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    Plan New Trip
                </Button>
            </Link>
            <Link href="/dashboard/trips">
               <Button variant="outline" className="h-12 px-8 rounded-xl font-bold">
                    View My Trips
                </Button>
            </Link>
        </div>
      </div>
    );
  }

  const { trip, day, timeline, upcoming } = data;
  const formattedDate = day ? new Date(day.date).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      weekday: 'long' 
  }) : "Today";

  return (
    <div className="min-h-screen bg-white">
      {/* Cinematic Header */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <img 
            src="https://images.unsplash.com/photo-1544971587-b842c2be37da?w=1600&q=80" 
            className="w-full h-full object-cover opacity-60 scale-105" 
            alt={trip.destination} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end">
          <Section className="pb-16" spacing="none">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                 <Badge className="bg-sky-500 hover:bg-sky-600 text-white border-none font-black px-4 py-1 rounded-lg">
                    ACTIVE TRIP
                 </Badge>
                 <span className="text-xs font-black uppercase tracking-[0.2em] text-white/90 drop-shadow-md">
                     {trip.title} {day && `• Day ${day.number}`}
                 </span>
              </div>
              <h1 className="text-6xl sm:text-9xl font-black font-heading tracking-tighter italic text-slate-900 leading-[0.85] filter drop-shadow-sm">
                Today — <span className="text-sky-600 drop-shadow-none">{trip.destination}</span>
              </h1>
            </motion.div>
          </Section>
        </div>
      </div>

      <Section className="py-24 relative z-10" spacing="none">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* Timeline */}
            <div className="lg:col-span-8">
               <div className="flex items-center justify-between mb-16 px-4 sm:px-0">
                  <div>
                     <h2 className="text-4xl font-black font-heading italic tracking-tighter text-slate-900">The Daily <span className="text-sky-500 underline decoration-sky-100 decoration-8 underline-offset-8">Flow</span></h2>
                     <p className="text-slate-400 text-sm font-bold mt-3 tracking-widest uppercase">{formattedDate}</p>
                  </div>
                  <Link href={`/dashboard/trips/${trip.id}`}>
                       <Button variant="ghost" className="rounded-2xl gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                           View Full Plan
                           <Navigation className="h-4 w-4" />
                       </Button>
                  </Link>
               </div>

               {timeline.length === 0 ? (
                   <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30">
                       <Coffee className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                       <p className="text-slate-400 font-bold max-w-xs mx-auto">No activities scheduled for today. Time for some spontaneous exploration!</p>
                   </div>
               ) : (
                   <div className="relative ml-4 sm:ml-8 pl-12 border-l-2 border-slate-100 space-y-20">
                      {timeline.map((item, idx) => {
                        const Icon = item.type === 'spot' ? MapPin : Sparkles;
                        const colorClass = item.type === 'spot' ? 'text-sky-500' : 'text-emerald-500';
                        const bgClass = item.type === 'spot' ? 'bg-sky-50/50' : 'bg-emerald-50/50';

                        return (
                         <motion.div 
                           key={item.id}
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: idx * 0.1 }}
                           className="relative"
                         >
                            {/* Node */}
                            <div className={cn(
                              "absolute -left-[61px] top-0 h-11 w-11 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer z-10",
                              bgClass, colorClass,
                              item.isUpcoming ? "ring-4 ring-sky-500/20" : "opacity-80 grayscale-[50%]"
                            )}>
                               <Icon className="h-5 w-5" />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-8 items-start">
                               <div className="min-w-[100px] pt-1">
                                  <span className={cn("text-2xl font-black transition-colors block leading-none", item.isUpcoming ? "text-slate-900" : "text-slate-300")}>
                                      {item.time}
                                  </span>
                                  <p className={cn("text-[8px] font-black uppercase tracking-[0.2em] leading-none mt-2", item.isUpcoming ? "text-sky-500" : "text-slate-300")}>
                                      {item.isUpcoming ? "UPCOMING" : "COMPLETED"}
                                  </p>
                               </div>
                               
                               <Card className={cn(
                                   "flex-1 rounded-[2.5rem] bg-white border-2 border-slate-50 overflow-hidden group transition-all duration-500",
                                   item.isUpcoming 
                                       ? "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-slate-100" 
                                       : "opacity-80 bg-slate-50/50 shadow-none border-transparent"
                               )}>
                                  <CardContent className="p-10">
                                     <div className="flex items-start justify-between mb-6">
                                        <div className="space-y-3">
                                           <div className="flex items-center gap-3">
                                              <h3 className={cn("text-2xl font-black italic tracking-tighter leading-tight transition-colors", item.isUpcoming ? "text-slate-900 group-hover:text-sky-600" : "text-slate-400")}>
                                                 {item.title}
                                              </h3>
                                              <div className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest", bgClass, colorClass)}>
                                                 {item.type}
                                              </div>
                                           </div>
                                           <div className="flex items-center gap-4 text-slate-400">
                                              <div className="flex items-center gap-2">
                                                 <Clock className="h-3.5 w-3.5" />
                                                 <span className="text-[10px] font-black uppercase tracking-widest leading-none">{item.time} - {item.endTime}</span>
                                              </div>
                                           </div>
                                        </div>
                                        <div className="h-12 w-12 rounded-[1.25rem] bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                           <ArrowRight className="h-6 w-6 text-slate-400" />
                                        </div>
                                     </div>
                                     <p className={cn("text-sm font-medium leading-relaxed max-w-xl", item.isUpcoming ? "text-slate-500" : "text-slate-400")}>
                                        {item.description}
                                     </p>
                                  </CardContent>
                               </Card>
                            </div>
                         </motion.div>
                        )
                      })}
                   </div>
               )}
            </div>

            {/* Sidebar Widgets */}
            <div className="lg:col-span-4 space-y-10">
               {/* Weather Widget */}
               <Card className="border-none bg-sky-500 rounded-[3.5rem] p-12 text-white shadow-2xl shadow-sky-500/30 relative overflow-hidden group">
                  <Sun className="absolute -top-10 -right-10 h-64 w-64 text-white/10 group-hover:rotate-45 transition-transform duration-1000" />
                  <div className="relative z-10">
                     <div className="flex items-center justify-between mb-12">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Local Weather Pulse</span>
                        <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                           <CloudSun className="h-6 w-6" />
                        </div>
                     </div>
                     <div className="flex items-end gap-3 mb-4">
                        <span className="text-7xl font-black tracking-tighter">22°</span>
                        <span className="text-xl font-black mb-3 uppercase tracking-widest opacity-80">Clear Sky</span>
                     </div>
                     <p className="text-white/70 text-sm font-bold tracking-wide">Ideal conditions for exploring {trip.destination}.</p>
                  </div>
               </Card>

               {/* Upcoming Widget */}
               {upcoming.length > 0 && (
                   <Card className="border-none bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                       <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-transparent" />
                       <div className="relative z-10">
                           <div className="flex items-center gap-4 mb-10">
                               <div className="h-12 w-12 rounded-[1.25rem] bg-white/10 flex items-center justify-center backdrop-blur-md">
                                   <Sparkles className="h-6 w-6 text-sky-400" />
                               </div>
                               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400">Next Adventure</span>
                           </div>
                           <h3 className="text-3xl font-black font-heading italic tracking-tighter leading-none mb-6">
                               {upcoming[0].title}
                           </h3>
                           <div className="flex items-center gap-3 text-white/60 text-sm font-bold uppercase tracking-widest mb-10">
                               <Clock className="h-4 w-4 text-sky-500" />
                               <span>Starts at {upcoming[0].time}</span>
                           </div>
                           <Button className="w-full h-16 rounded-[1.5rem] bg-white text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-sky-500 hover:text-white transition-all shadow-xl shadow-black/20">
                               View Journey Details
                           </Button>
                       </div>
                   </Card>
               )}

               {/* Quick Actions */}
               <div className="grid grid-cols-2 gap-6">
                  <Button className="h-24 rounded-[2.5rem] bg-white border-2 border-slate-50 shadow-sm text-slate-900 flex flex-col gap-2 hover:bg-slate-50 hover:border-slate-100 transition-all transition-transform hover:scale-[1.02]">
                     <MapPin className="h-6 w-6 text-sky-500" />
                     <span className="text-[9px] font-black uppercase tracking-[0.2em]">Map View</span>
                  </Button>
                  <Button className="h-24 rounded-[2.5rem] bg-white border-2 border-slate-50 shadow-sm text-slate-900 flex flex-col gap-2 hover:bg-slate-50 hover:border-slate-100 transition-all transition-transform hover:scale-[1.02]">
                     <Sparkles className="h-6 w-6 text-amber-500" />
                     <span className="text-[9px] font-black uppercase tracking-[0.2em]">Share Day</span>
                  </Button>
               </div>
            </div>
         </div>
      </Section>
    </div>
  );
}
