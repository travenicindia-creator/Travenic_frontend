"use client";

import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  MapPin, 
  Clock, 
  Compass,
  Sparkles,
  Mountain,
  Waves,
  Trees,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import destinationService, { Destination } from "@/services/destinationService";

const ICON_MAP: Record<string, any> = {
  "Shillong": Mountain,
  "Sohra": Trees,
  "Dawki": Waves,
};

const COLOR_MAP: Record<string, string> = {
  "Shillong": "emerald",
  "Sohra": "blue",
  "Dawki": "cyan",
};

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const data = await destinationService.getDestinations();
        setDestinations(data);
      } catch (err: any) {
        setError(err.message || "Failed to load destinations");
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Charting the unknown...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center">
        <div className="max-w-md">
          <AlertCircle className="h-16 w-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 mb-4">Discovery Offline</h2>
          <p className="text-slate-500 font-medium mb-8">{error}</p>
          <Button onClick={() => window.location.reload()} className="h-14 px-8 rounded-2xl">Retry Connection</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 opacity-[0.4] pointer-events-none" 
           style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)", backgroundSize: "40px 40px" }} 
      />

      <Section className="py-24 relative z-10">
        <div className="max-w-3xl mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-primary rounded-full" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Discovery</span>
            </div>
            <h1 className="text-6xl sm:text-8xl font-black font-heading tracking-tighter italic leading-none mb-8 text-slate-900">
              Where to <span className="text-primary italic">Explore?</span>
            </h1>
            <p className="text-slate-500 text-xl leading-relaxed font-medium">
              Meghalaya's landscape is a masterclass in nature's artistry. From misty peaks to crystal rivers, choose your next chapter.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {destinations.map((dest, idx) => {
            const Icon = ICON_MAP[dest.name] || Compass;
            const colorName = COLOR_MAP[dest.name] || "slate";
            const gradientColor = `from-${colorName}-500/20 to-${colorName}-500/0`;
            const accentClass = `text-${colorName}-500`;

            return (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -12 }}
                className="group"
              >
                <Link href={`/destinations/${dest.id}`}>
                  <Card className="border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] rounded-[3rem] overflow-hidden bg-white h-full relative border border-slate-100 flex flex-col">
                    {/* Image Header */}
                    <div className="h-72 overflow-hidden relative">
                      <img 
                        src={dest.image || "https://images.unsplash.com/photo-1544971587-b842c2be37da?w=800&q=80"} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        alt={dest.name} 
                      />
                      <div className={cn("absolute inset-0 bg-gradient-to-t", gradientColor)} />
                      <div className="absolute top-6 left-6">
                         <div className="bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/50 shadow-xl flex items-center gap-2">
                            <Icon className={cn("h-4 w-4", accentClass)} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{dest.spotCount} Spots</span>
                         </div>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-10 flex flex-col flex-1">
                      <div className="mb-6">
                        <h3 className="text-4xl font-black font-heading tracking-tight text-slate-900 mb-2 group-hover:text-primary transition-colors">
                          {dest.name}
                        </h3>
                        <p className={cn("text-xs font-black uppercase tracking-[0.2em]", accentClass)}>
                          Explorer Guide
                        </p>
                      </div>
                      
                      <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-1 line-clamp-3">
                        {dest.description}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Detailed Guide available</span>
                         <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                            <ArrowRight className="h-6 w-6" />
                         </div>
                      </div>
                    </CardContent>

                    {/* Hover Accent Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </Section>

      <Section className="py-24 bg-slate-50/50">
        <div className="bg-primary p-12 sm:p-20 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl shadow-primary/30">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48" />
           <div className="relative z-10 max-w-xl text-center md:text-left">
              <Sparkles className="h-12 w-12 mb-8 mx-auto md:mx-0 text-white/40" />
              <h2 className="text-4xl sm:text-6xl font-black font-heading italic tracking-tighter leading-none mb-6">
                Curated Collections
              </h2>
              <p className="text-white/80 text-xl font-medium">
                Not sure where to start? Browse our collections categorized by travel style and intensity.
              </p>
           </div>
           <Button className="h-20 px-16 rounded-3xl font-black text-2xl bg-white text-primary hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 shadow-2xl relative z-10 group">
              View Collections
              <Compass className="h-6 w-6 ml-3 group-hover:rotate-45 transition-transform" />
           </Button>
        </div>
      </Section>
    </div>
  );
}
