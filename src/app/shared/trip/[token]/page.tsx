"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { MapPin, Calendar, Loader2, AlertCircle, Users } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import Image from "next/image";
import { getSharedTrip } from "@/services/features.service";

export default function SharedTripPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSharedTrip(token);
        setTrip(data.trip);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load trip.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">Link Expired or Invalid</h2>
      <p className="text-muted-foreground">{error}</p>
    </div>
  );

  return (
    <Section spacing="md" className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center py-8">
          <Badge className="bg-primary/10 text-primary border-none mb-4">Shared Trip</Badge>
          <h1 className="text-4xl font-black font-heading tracking-tight mb-2">{trip.title}</h1>
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{format(new Date(trip.startDate), "MMM d")} – {format(new Date(trip.endDate), "MMM d, yyyy")}</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{trip.destination?.name}</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" />{trip.travelerCount} travelers</span>
          </div>
        </div>

        {/* Itinerary Days */}
        <div className="space-y-6">
          {(trip.itineraryDays || []).map((day: any) => (
            <Card key={day.id} className="border-none ring-1 ring-border/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-primary/10 text-primary border-none font-bold">Day {day.dayNumber}</Badge>
                  <span className="text-sm text-muted-foreground">{format(new Date(day.date), "EEEE, MMM d")}</span>
                  {day.destination && <Badge variant="outline" className="ml-auto text-[10px]">{day.destination.name}</Badge>}
                </div>
                <div className="grid gap-3">
                  {(day.newSlots || []).map((slot: any) => (
                    <div key={slot.id}>
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                        {slot.slotType === 'MORNING' ? '🌅' : slot.slotType === 'AFTERNOON' ? '☀️' : '🌙'} {slot.slotType}
                      </div>
                      <div className="grid gap-2">
                        {(slot.blocks || []).filter((b: any) => b.blockType === 'SPOT' && b.spot).map((block: any) => (
                          <div key={block.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                            {block.spot.thumbnailUrl && <Image src={block.spot.thumbnailUrl} fill sizes="40px" alt={block.title} className="!relative h-10 w-10 rounded-lg object-cover" />}
                            <div>
                              <div className="font-bold text-sm">{block.title}</div>
                              {block.spot.aiSummary && <p className="text-[10px] text-muted-foreground line-clamp-1">{block.spot.aiSummary}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center py-8 text-muted-foreground text-sm">
          Shared via <span className="font-bold text-primary">Travenic</span> — AI-powered travel planning
        </div>
      </motion.div>
    </Section>
  );
}
