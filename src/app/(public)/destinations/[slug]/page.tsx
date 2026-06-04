"use client";

import { useState, useEffect, use } from "react";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Sparkles,
  Mountain,
  Trees,
  Waves,
  Sun,
  Navigation,
  Star,
  Camera,
  Heart,
  Loader2, 
  AlertCircle, 
  ChevronRight as ChevronRightIcon
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import destinationService, { DestinationDetail } from "@/services/destinationService";


export default function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<DestinationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const detail = await destinationService.getDestinationWithSpots(resolvedParams.slug);
        setData(detail);
      } catch (err: any) {
        setError(err.message || "Failed to load destination details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resolvedParams.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Arriving at your destination...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center">
        <div className="max-w-md">
          <AlertCircle className="h-16 w-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 mb-4">Route Blocked</h2>
          <p className="text-slate-500 font-medium mb-8">{error || "Destination not found"}</p>
          <Link href="/destinations">
            <Button className="h-14 px-8 rounded-2xl">Return to Explorer</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="relative h-[80vh] min-h-[600px] overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10 }}
          src={data.image || "https://images.unsplash.com/photo-1544971587-b842c2be37da?w=1600&q=80"} 
          className="absolute inset-0 w-full h-full object-cover" 
          alt={data.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        <Section className="h-full relative z-10 flex flex-col justify-end pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link 
              href="/destinations" 
              className="inline-flex items-center text-sm font-bold text-white/60 hover:text-white transition-all group mb-8 bg-black/20 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Destinations
            </Link>
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
               <div className="bg-primary px-4 py-1.5 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2">
                  <Mountain className="h-4 w-4" />
                  Highlands
               </div>
               <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md font-bold px-3 py-1">
                  OFFICIAL GUIDE
               </Badge>
            </div>

            <h1 className="text-7xl sm:text-9xl font-black font-heading tracking-tighter italic text-white leading-none mb-8 line-clamp-2">
               {data.name}
            </h1>

            <div className="flex flex-wrap gap-8 items-center bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 w-fit shadow-2xl">
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Best Season</span>
                  <span className="text-xl font-bold text-white">Oct - May</span>
               </div>
               <div className="w-px h-10 bg-white/10 hidden sm:block" />
               <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Visit Length</span>
                  <span className="text-xl font-bold text-white">2-4 Days</span>
               </div>
               <Button className="h-16 px-10 rounded-2xl font-black text-lg bg-primary hover:bg-white hover:text-primary transition-all shadow-xl shadow-primary/20 lg:ml-8 gap-2 group">
                  Plan Trip to {data.name}
                  <Navigation className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
               </Button>
            </div>
          </motion.div>
        </Section>
      </div>

      <Section className="py-24 relative z-10 flex flex-col lg:flex-row gap-20">
         {/* Main Content */}
         <div className="lg:col-span-8 flex-1">
            <div className="max-w-3xl">
               <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-6">At a Glance</h2>
               <p className="text-4xl text-slate-900 font-black font-heading italic leading-tight mb-10">
                  {data.name}. A sanctuary for the restless heart.
               </p>
               <p className="text-slate-500 text-xl font-medium leading-relaxed mb-16">
                  {data.description}
               </p>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-24">
                  <Card className="border-none bg-slate-50 p-10 rounded-[3rem] shadow-inner flex flex-col gap-6">
                     <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                        <Sparkles className="h-6 w-6" />
                     </div>
                     <h3 className="text-2xl font-black italic tracking-tight text-slate-900 leading-tight">Expert Perspective</h3>
                     <p className="text-slate-500 font-medium leading-relaxed">
                        Meghalaya is as much about the music and cafes as it is about the clouds. Spend your mornings at the canyons and your evenings exploring the indie music scene.
                     </p>
                  </Card>
                  <Card className="border-none bg-slate-900 p-10 rounded-[3rem] shadow-2xl flex flex-col gap-6 text-white relative overflow-hidden">
                     <Star className="absolute -bottom-4 -right-4 h-32 w-32 text-white/5 rotate-12" />
                     <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/10 relative z-10">
                        <Heart className="h-6 w-6" />
                     </div>
                     <h3 className="text-2xl font-black italic tracking-tight leading-tight relative z-10">Why We Love It</h3>
                     <p className="text-white/60 font-medium leading-relaxed relative z-10">
                        The raw connectivity with nature. There are very few places where you feel this small and this alive at the same time.
                     </p>
                  </Card>
               </div>
            </div>

            {/* Travel Spots */}
            <div className="mb-24">
               <div className="flex items-center justify-between mb-12">
                  <h2 className="text-4xl font-black font-heading tracking-tighter italic text-slate-900">Top <span className="text-primary">Spots</span></h2>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {data.spots.map((spot) => (
                     <motion.div 
                        key={spot.id}
                        whileHover={{ x: 8 }}
                        className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all flex items-center gap-5 group"
                     >
                        <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                           {spot.name.toLowerCase().includes("falls") || spot.name.toLowerCase().includes("lake") ? <Waves className="h-8 w-8" /> : <Mountain className="h-8 w-8" />}
                        </div>
                        <div>
                           <h4 className="text-xl font-bold text-slate-900">{spot.name}</h4>
                           <span className="text-xs font-black uppercase tracking-widest text-slate-400">{spot.bestTimeToVisit || "Year-round"}</span>
                        </div>
                     </motion.div>
                  ))}
               </div>
            </div>
         </div>

         {/* Sidebar Navigation */}
         <div className="lg:w-96 sticky top-12 h-fit">
            <Card className="border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] bg-slate-50 p-10 space-y-10 border border-slate-100">
               <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-6">Explore More</h3>
                  <div className="space-y-6">
                    <Link href="/destinations" className="flex items-center justify-between group">
                       <span className="text-2xl font-black font-heading italic text-slate-400 group-hover:text-slate-900 transition-colors">
                          Back to Explorer
                       </span>
                       <div className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:border-primary transition-all">
                          <ChevronRightIcon className="h-4 w-4 text-primary" />
                       </div>
                    </Link>
                  </div>
               </div>
               
               <div className="pt-10 border-t border-slate-200">
                  <p className="text-sm font-bold text-slate-400 mb-6 leading-relaxed">
                     Planning a multi-destination trip? Use our architect to bridge these worlds.
                  </p>
                  <Link href="/dashboard">
                    <Button className="w-full h-16 rounded-2xl font-black bg-white text-slate-900 border border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm shadow-slate-200/50">
                       Smart Architect
                    </Button>
                  </Link>
               </div>
            </Card>
         </div>
      </Section>
    </div>
  );
}
