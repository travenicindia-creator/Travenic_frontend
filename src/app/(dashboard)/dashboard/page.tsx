"use client";

import { useAuthStore } from "@/store/use-auth-store";
import { Section } from "@/components/ui/section";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Send, Plus, ArrowRight, Loader2, Sparkles, Map, NotebookPen, Brain } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { tripService, Trip } from "@/services/trip.service";
import { getDashboardStats, DashboardStats } from "@/services/features.service";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripData, statsData] = await Promise.all([
          tripService.getTrips(),
          getDashboardStats(),
        ]);
        setTrips(tripData.trips || []);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeTrip = trips.find(t => t.status === 'ONGOING') || trips[0];

  const formatDateRange = (start: string, end: string) => {
    try {
      return `${format(new Date(start), "MMM d")} – ${format(new Date(end), "MMM d")}`;
    } catch (e) {
      return "Dates tbd";
    }
  };

  const statCards = [
    { label: "Spots Visited", value: stats?.spotsVisited || 0, icon: MapPin, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Days Traveled", value: stats?.daysTraveled || 0, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "States Explored", value: stats?.statesExplored || 0, icon: Map, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "AI Generations", value: stats?.aiGenerations || 0, icon: Brain, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Section spacing="md" className="p-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
          Welcome back, <span className="text-primary italic">{user?.name?.split(' ')[0] || 'Traveler'}!</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what me and my AI are cooking for your next journey.
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Active Trip Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          {activeTrip ? (
            <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-primary/10 via-background to-background ring-1 ring-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/30 transition-colors uppercase tracking-widest text-[10px] font-bold px-3 py-1">
                    {activeTrip.status} Trip
                  </Badge>
                </div>
                <CardTitle className="text-4xl font-black mt-4 font-heading tracking-tighter">
                  {activeTrip.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-base font-medium text-foreground/70">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formatDateRange(activeTrip.startDate, activeTrip.endDate)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/40 border border-border/50 text-sm font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {activeTrip.destination.name}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/50">
                <Link 
                  href={`/dashboard/trips/${activeTrip.id}`}
                  className={cn(buttonVariants({ variant: "default" }), "w-full sm:w-auto rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20 gap-2 group")}
                >
                  Open Trip
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/dashboard/create"
                  className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto rounded-xl px-8 h-12 font-bold gap-2")}
                >
                  <Plus className="h-4 w-4" />
                  Create New Trip
                </Link>
              </CardFooter>
            </Card>
          ) : (
             <Card className="h-full border-[3px] border-dashed border-slate-100 bg-white/50 rounded-[2rem] flex flex-col items-center justify-center p-12 text-center group">
               <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 ring-1 ring-slate-100 group-hover:scale-110 transition-transform">
                  <Plus className="h-10 w-10 text-slate-300" />
               </div>
               <h3 className="text-2xl font-black font-heading mb-2">No active journeys</h3>
               <p className="text-slate-400 max-w-xs mb-8">Start architecting your next big adventure today.</p>
               <Link 
                 href="/dashboard/create"
                 className={cn(buttonVariants({ variant: "default" }), "rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20")}
               >
                 Create Your First Trip
               </Link>
             </Card>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Card className="border-none shadow-sm bg-accent/5 overflow-hidden group hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
                      <Icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                    <div>
                      <div className="text-2xl font-black font-heading tracking-tight">{stat.value}</div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Create Trip", href: "/dashboard/create", icon: Plus, color: "text-primary" },
          { label: "Explore India", href: "/explore", icon: MapPin, color: "text-emerald-500" },
          { label: "My Trips", href: "/dashboard/trips", icon: Send, color: "text-blue-500" },
          { label: "AI Planner", href: "/dashboard/create", icon: Sparkles, color: "text-amber-500" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}>
              <Card className="border-none shadow-sm hover:-translate-y-1 transition-all cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Icon className={cn("h-5 w-5", action.color)} />
                  </div>
                  <span className="text-sm font-bold">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Trips */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
           <Send className="h-5 w-5 text-primary" />
           Recent Trips
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trips.slice(0, 3).map((trip) => (
            <Link key={trip.id} href={`/dashboard/trips/${trip.id}`}>
              <Card className="border-none shadow-sm hover:translate-y-[-2px] transition-all cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <MapPin className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{trip.title}</p>
                    <p className="text-xs text-muted-foreground">{trip.destination.name}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto text-[9px] font-bold">{trip.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
          {trips.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-400 italic">
                Your travel log is empty... for now.
             </div>
          )}
        </div>
      </div>
    </Section>
  );
}
