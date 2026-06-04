"use client";

import { use as reactUse, useState, useEffect } from "react";
import { Section } from "@/components/ui/section";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Sparkles,
  Info,
  Car,
  Navigation,
  ExternalLink,
  Star,
  Loader2,
  AlertCircle,
  Timer,
  Route,
  ChevronRight,
  Utensils,
  Camera,
  Heart,
  Calendar,
  Wallet,
  Trophy,
  Lightbulb,
  Plus,
  Bus
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { spotService, SpotDetail } from "@/services/spot.service";
import MapRoute, { MapLocation } from "@/components/ui/MapRoute";
import { PublicTransportModal } from "@/components/itinerary/TransportModals";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { ItemChatSection } from "@/components/ui/ItemChatSection";

export default function SpotDetailPage({ params }: { params: Promise<{ idOrSlug: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromTrip = searchParams.get('fromTrip');
  const day = searchParams.get('day');
  
  const backLink = fromTrip && day 
    ? `/dashboard/trips/${fromTrip}/days/${day}`
    : "/destinations";

  const resolvedParams = reactUse(params);
  const [data, setData] = useState<SpotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublicTransportOpen, setIsPublicTransportOpen] = useState(false);

  useEffect(() => {
    const fetchSpotData = async () => {
      try {
        setLoading(true);
        const input = resolvedParams.idOrSlug;
        
        // Simple UUID detection: 8-4-4-4-12 hex characters
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input);
        
        const spotData = isUuid 
          ? await spotService.getSpotById(input)
          : await spotService.getSpotBySlug(input);
          
        setData(spotData);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || "Failed to load spot details.");
      } finally {
        setLoading(false);
      }
    };
    fetchSpotData();
  }, [resolvedParams.idOrSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-500 font-bold animate-pulse">Uncovering Hidden Gems...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Spot Not Found</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">{error || "We couldn't find this travel spot."}</p>
        <Link href="/destinations">
          <Button variant="outline" className="rounded-xl px-8 font-bold">Explore Destinations</Button>
        </Link>
      </div>
    );
  }

  const mapLocations: MapLocation[] = [{
    id: data.id || resolvedParams.idOrSlug,
    name: data.spot_name,
    lat: data.latitude,
    lng: data.longitude
  }];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32">
      {/* Hero Section */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <img 
          src={data.hero_image} 
          alt={data.spot_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <Section className="p-0">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <Link 
                    href={backLink} 
                    className="inline-flex items-center text-sm font-bold text-white/70 hover:text-white transition-all group mb-8 bg-black/40 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10"
                >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    {fromTrip ? "Back to Itinerary" : "Back to Exploration"}
                </Link>
                <div className="flex items-center gap-3 mb-6">
                    <Badge className="bg-primary text-white border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">
                        MUST VISIT
                    </Badge>
                    <div className="flex items-center gap-1 text-white/90">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-sm">4.9 (2.4k Reviews)</span>
                    </div>
                </div>
                <h1 className="text-6xl md:text-8xl font-black font-heading tracking-tighter italic leading-[0.8] text-white mb-8">
                    {data.spot_name}
                </h1>
                
                <div className="flex flex-wrap gap-4">
                    <Button 
                        size="lg" 
                        onClick={() => toast.success("Added to your wishlist!", { description: "You can find this in your profile." })}
                        className="rounded-2xl h-16 px-10 font-black text-lg gap-3 bg-white text-black hover:bg-slate-100 shadow-2xl transition-all"
                    >
                        <Plus className="h-6 w-6" />
                        Add to Itinerary
                    </Button>
                    <Button 
                        size="lg"
                        className="rounded-2xl h-16 px-10 font-black text-lg gap-3 bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition-all"
                    >
                        <Heart className="h-6 w-6" />
                        Save for Later
                    </Button>
                </div>
            </motion.div>
          </Section>
        </div>
      </div>

      <Section className="py-20 relative z-10 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">
            <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                <h2 className="text-3xl font-black font-heading tracking-tight mb-8 flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-primary" />
                    Overview
                </h2>
                <div className="prose prose-lg max-w-none text-slate-600 font-medium leading-relaxed mb-12">
                   <p>{data.description}</p>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <Calendar className="h-6 w-6 text-primary mb-3" />
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Best Months</p>
                        <p className="text-sm font-black text-slate-900">{data.best_time}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <Clock className="h-6 w-6 text-orange-400 mb-3" />
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Opening Hours</p>
                        <p className="text-sm font-black text-slate-900">
                            {data.opening_time ? `${data.opening_time} - ${data.closing_time}` : "Open Anytime"}
                        </p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <Wallet className="h-6 w-6 text-emerald-500 mb-3" />
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Entry Fee</p>
                        <p className="text-sm font-black text-slate-900">₹{data.entry_fee || "Free Entrance"}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <Timer className="h-6 w-6 text-indigo-400 mb-3" />
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Duration</p>
                        <p className="text-sm font-black text-slate-900">{data.visit_duration_minutes} Minutes</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <Trophy className="h-6 w-6 text-yellow-500 mb-3" />
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Difficulty</p>
                        <p className="text-sm font-black text-slate-900 capitalize">{data.difficulty_level}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <Navigation className="h-6 w-6 text-red-400 mb-3" />
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Adventure</p>
                        <p className="text-sm font-black text-slate-900">Recommended</p>
                    </div>
                </div>
            </div>

            {/* Activities */}
            {data.activities && data.activities.length > 0 && (
                <div className="space-y-8">
                    <h2 className="text-3xl font-black font-heading tracking-tight flex items-center gap-3 px-4">
                        <Star className="h-8 w-8 text-primary" />
                        Available Activities
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {data.activities.map((act) => (
                            <motion.div 
                                key={act.id}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all"
                            >
                                <Badge className="mb-4 bg-primary/10 text-primary border-none font-black text-[10px] tracking-widest">
                                    {act.duration} MINS
                                </Badge>
                                <h3 className="text-xl font-black font-heading mb-3">{act.title}</h3>
                                <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2">
                                    {act.description}
                                </p>
                                <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Starting At</p>
                                        <p className="text-xl font-black text-primary italic">₹{act.price}</p>
                                    </div>
                                    <Button variant="outline" className="rounded-xl font-black text-[11px] uppercase tracking-widest h-10 px-6 border-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
                                        Book Activity
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Summary */}
            {data.ai_summary && (
                <div className="bg-primary/5 rounded-[3rem] p-12 border border-primary/10 relative overflow-hidden group">
                    <Sparkles className="absolute -top-10 -right-10 h-64 w-64 text-primary/5 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black italic font-heading mb-6 text-primary flex items-center gap-3">
                            AI-Generated Summary
                        </h2>
                        <p className="text-slate-600 font-bold text-lg leading-relaxed italic">
                            "{data.ai_summary}"
                        </p>
                    </div>
                </div>
            )}

            {/* AI Doubt Chat Assistant */}
            <ItemChatSection 
                itemId={data.id} 
                itemType="spot" 
                itemName={data.spot_name} 
                theme="light" 
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            {/* Travel Tips Card */}
            {data.travel_tips && (
                <Card className="bg-slate-900 text-white rounded-[3rem] p-10 border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <Lightbulb className="h-10 w-10 text-yellow-400 opacity-50" />
                    </div>
                    <h3 className="text-2xl font-black italic font-heading mb-8 relative z-10">Pro Travel Tips</h3>
                    <ul className="space-y-6 relative z-10">
                        {data.travel_tips.split('. ').map((tip, idx) => (
                            tip && (
                                <li key={idx} className="flex gap-4">
                                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <p className="text-slate-300 font-medium leading-relaxed">{tip}.</p>
                                </li>
                            )
                        ))}
                    </ul>
                </Card>
            )}

            {/* Map Preview */}
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 overflow-hidden">
                <h3 className="text-xl font-black font-heading mb-6 flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-red-500" />
                    Location
                </h3>
                <div className="h-72 rounded-[2rem] bg-slate-100 relative overflow-hidden mb-8 border border-slate-100 shadow-inner">
                   <MapRoute locations={mapLocations} className="absolute inset-0 w-full h-full" />
                </div>
                <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <Navigation className="h-8 w-8 text-primary" />
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Get Directions</p>
                        <p className="text-sm font-black text-slate-900 italic">Open in Google Maps</p>
                    </div>
                </div>
                <div 
                    onClick={() => setIsPublicTransportOpen(true)}
                    className="mt-4 flex items-center gap-4 bg-emerald-50/50 hover:bg-emerald-50 p-6 rounded-2xl border border-emerald-100 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer relative group"
                >
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                      <Bus className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Interactive Guide</p>
                        <p className="text-sm font-black text-emerald-950 italic">Public Transport Options</p>
                    </div>
                </div>
            </div>

            {/* Nearby Spots */}
            {data.nearby_spots && data.nearby_spots.length > 0 && (
                <div className="space-y-8">
                    <h3 className="text-xl font-black font-heading flex items-center gap-2 px-2">
                        <Navigation className="h-6 w-6 text-primary" />
                        Explore Nearby
                    </h3>
                    <div className="space-y-4">
                        {data.nearby_spots.map((spot) => (
                            <Link 
                                href={`/spots/${spot.slug || spot.id}`} 
                                key={spot.id}
                                className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 hover:shadow-lg hover:border-primary/20 transition-all group"
                            >
                                <div className="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0">
                                    <img src={spot.image} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt={spot.name} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm leading-tight mb-1">{spot.name}</h4>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Within 10km</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors mr-2" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </Section>
      {data && (
        <PublicTransportModal 
          isOpen={isPublicTransportOpen}
          onClose={() => setIsPublicTransportOpen(false)}
          block={{ name: data.spot_name }}
        />
      )}
    </div>
  );
}
