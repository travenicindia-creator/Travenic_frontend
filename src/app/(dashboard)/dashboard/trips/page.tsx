"use client";

import { Section } from "@/components/ui/section";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Plus, ArrowRight, Plane, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { tripService, Trip } from "@/services/trip.service";
import { format } from "date-fns";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await tripService.getTrips();
        setTrips(data.trips || []);
      } catch (error) {
        console.error("Failed to fetch trips:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const activeTrips = trips.filter((t) => ["ACTIVE", "ONGOING"].includes(t.status.toUpperCase()));
  const upcomingTrips = trips.filter((t) => ["UPCOMING", "PLANNED", "DRAFT", "CONFIRMED"].includes(t.status.toUpperCase()));
  const completedTrips = trips.filter((t) => ["COMPLETED"].includes(t.status.toUpperCase()));

  const formatDateRange = (start: string, end: string) => {
    try {
      return `${format(new Date(start), "MMM d, yyyy")} – ${format(new Date(end), "MMM d, yyyy")}`;
    } catch (e) {
      return "Dates tbd";
    }
  };

  const TripSection = ({ title, icon: Icon, colorClass, trips }: { title: string, icon: any, colorClass: string, trips: Trip[] }) => (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <div className={cn("p-2 rounded-lg", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <Badge variant="outline" className="ml-2 bg-muted/50 border-none font-bold">
          {trips.length}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip: Trip, idx: number) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link href={`/dashboard/trips/${trip.id}`} className="block group">
              <Card className="h-full border-none shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ring-1 ring-border/50 group-hover:ring-primary/20 bg-background/50 backdrop-blur-sm overflow-hidden">
                <div className={cn("h-1.5 w-full", 
                   trip.status.toUpperCase() === 'ACTIVE' || trip.status.toUpperCase() === 'ONGOING' ? 'bg-emerald-500' : 
                   trip.status.toUpperCase() === 'COMPLETED' ? 'bg-slate-400' : 'bg-amber-500'
                )} />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={cn("font-bold text-[10px] tracking-widest uppercase px-2 py-0.5", 
                       trip.status.toUpperCase() === 'ACTIVE' || trip.status.toUpperCase() === 'ONGOING' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                       trip.status.toUpperCase() === 'COMPLETED' ? 'bg-slate-500/10 text-slate-600 border-slate-500/20' : 
                       'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    )}>
                      {trip.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold font-heading line-clamp-1 group-hover:text-primary transition-colors">
                    {trip.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-xs">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border/30">
                      <MapPin className="h-3 w-3" />
                      {trip.destination.name}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-end">
                  <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-bold">
                    View Plan <ArrowRight className="h-3 w-3" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          </motion.div>
        ))}
        {trips.length === 0 && (
          <div className="col-span-full py-12 border-2 border-dashed border-muted rounded-2xl flex flex-col items-center justify-center text-muted-foreground">
             <Calendar className="h-8 w-8 mb-4 opacity-20" />
             <p className="text-sm font-medium">No trips in this category.</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Section spacing="md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">My Trips</h1>
          <p className="text-muted-foreground">Orchestrate your worldly explorations with precision.</p>
        </div>
        <Link 
          href="/dashboard/create"
          className={cn(buttonVariants({ variant: "default" }), "rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 gap-2")}
        >
          <Plus className="h-5 w-5" />
          Create Trip
        </Link>
      </div>

      <TripSection 
        title="Active Journey" 
        icon={Plane} 
        colorClass="bg-emerald-500/10 text-emerald-600" 
        trips={activeTrips} 
      />
      
      <TripSection 
        title="Upcoming Adventures" 
        icon={Clock} 
        colorClass="bg-amber-500/10 text-amber-600" 
        trips={upcomingTrips} 
      />
      
      <TripSection 
        title="Completed Expeditions" 
        icon={CheckCircle2} 
        colorClass="bg-slate-500/10 text-slate-600" 
        trips={completedTrips} 
      />
    </Section>
  );
}
