"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Section } from "@/components/ui/section";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Map as MapIcon, 
  Settings, 
  Edit,
  Info,
  Users,
  Loader2,
  AlertCircle,
  Share2,
  Printer,
  TrainFront,
  Bus,
  Car,
  Plane,
  Navigation, 
  Calendar, 
  MapPin, 
  Sparkles,
  ChevronRight,
  Clock,
  Play,
  CheckCircle2,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Navigation as NavigationIcon
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { tripService, Trip } from "@/services/trip.service";
import MapRoute, { MapLocation } from "@/components/ui/MapRoute";
import { ShareModal } from "@/components/ui/ShareModal";
import { toast } from "sonner";
import { StartDetailsModal } from "@/components/ui/StartDetailsModal";
import { ReturnDetailsModal } from "@/components/ui/ReturnDetailsModal";
import { TripChecklist } from "@/components/features/TripChecklist";
import { TripBudget } from "@/components/features/TripBudget";
import { TripQuickFeatures } from "@/components/features/TripQuickFeatures";
import { ItemChatSection } from "@/components/ui/ItemChatSection";

export default function TripOverviewPage({ params }: { params: Promise<{ tripId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isStartDetailsModalOpen, setIsStartDetailsModalOpen] = useState(false);
  const [isReturnDetailsModalOpen, setIsReturnDetailsModalOpen] = useState(false);

  const fetchTripData = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTrip(resolvedParams.tripId);
      setTrip(data);
    } catch (err: any) {
      setError(err.message || "Failed to load trip details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripData();
  }, [resolvedParams.tripId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Adventure Interrupted</h2>
        <p className="text-muted-foreground mb-6">{error || "Trip not found."}</p>
        <Link href="/dashboard/trips">
          <Button>Back to My Trips</Button>
        </Link>
      </div>
    );
  }

  const mapLocations: MapLocation[] = [
    ...(trip?.destinations?.flatMap((td: any) => 
      (td.destination.travelSpots || []).map((spot: any) => ({
        id: spot.id,
        name: spot.name,
        lat: spot.latitude,
        lng: spot.longitude
      }))
    ) || []),
    ...(trip?.tripDays?.flatMap(day => 
      (day.itineraryItems || [])
        .filter(item => item.travelSpot?.latitude && item.travelSpot?.longitude)
        .map(item => ({
          id: item.travelSpot!.id,
          name: item.travelSpot!.name,
          lat: item.travelSpot!.latitude!,
          lng: item.travelSpot!.longitude!
        }))
    ) || [])
  ];

  // De-duplicate markers by ID
  const uniqueMapLocations = Array.from(new Map(mapLocations.map(loc => [loc.id, loc])).values());

  const startDate = new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endDate = new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const destinationNames = trip.destinations?.map(td => td.destination.name).join(' → ') || trip.destination.name;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative h-[400px] sm:h-[450px] overflow-hidden bg-slate-900">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105 opacity-60"
          style={{ backgroundImage: `url(${trip.destination.heroImage || 'https://images.unsplash.com/photo-1596422846543-75c6fc18a593?w=800&q=80'})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-background" />
        
        <div className="absolute inset-0 flex flex-col justify-end pb-12">
          <Section>
            <Link 
              href="/dashboard/trips" 
              className="inline-flex items-center text-sm font-bold text-primary-foreground/80 mb-6 hover:text-white transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Trips
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-primary text-primary-foreground border-none px-3 py-1 font-bold uppercase tracking-wider text-xs">
                    {trip.status}
                  </Badge>
                  {['CONFIRMED', 'ONGOING', 'COMPLETED'].includes(trip.status.toUpperCase()) ? (
                    <Badge className="bg-emerald-500 text-white border-none px-3 py-1 font-bold uppercase tracking-wider text-xs">
                      Confirmed
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500 text-white border-none px-3 py-1 font-bold uppercase tracking-wider text-xs animate-pulse">
                      Pending Confirmation
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl sm:text-7xl font-black tracking-tight text-white font-heading leading-tight italic mb-2">
                  {trip.title}
                </h1>
                <p className="text-primary font-black text-xl uppercase tracking-widest mb-4 drop-shadow-lg">
                  {destinationNames}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <p className="text-white/90 flex items-center gap-2 font-bold text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    {startDate} – {endDate}
                  </p>
                  <div className="h-1 w-1 rounded-full bg-white/30" />
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <div className="flex -space-x-2 mr-2">
                       {trip.members?.slice(0, 3).map((member) => (
                           <div key={member.id} className="w-8 h-8 rounded-full border-2 border-background/50 bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                               {member.user.avatarUrl ? (
                                   <img src={member.user.avatarUrl} alt={member.user.name} className="w-full h-full object-cover" />
                               ) : (
                                   <span className="text-xs font-black text-white">{member.user.name.charAt(0).toUpperCase()}</span>
                               )}
                           </div>
                       ))}
                       {trip.members && trip.members.length > 3 && (
                           <div className="w-8 h-8 rounded-full border-2 border-background/50 bg-muted flex items-center justify-center shrink-0">
                               <span className="text-xs font-black text-muted-foreground">+{trip.members.length - 3}</span>
                           </div>
                       )}
                       {(!trip.members || trip.members.length === 0) && (
                           <div className="w-8 h-8 rounded-full border-2 border-background/50 bg-primary/20 flex items-center justify-center shrink-0">
                               <span className="text-xs font-black text-white">?</span>
                           </div>
                       )}
                    </div>
                    <p className="text-white/90 font-medium text-sm pr-1">
                      {trip.travelerCount} Adventurers
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setIsShareModalOpen(true)}
                  variant="outline" 
                  className="h-14 rounded-2xl px-6 font-bold text-white border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 gap-2"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </Button>
                <Button 
                  onClick={() => window.print()}
                  variant="outline" 
                  className="h-14 rounded-2xl px-6 font-bold text-white border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 gap-2 print:hidden"
                >
                  <Printer className="h-5 w-5" />
                  Offline PDF
                </Button>
                {['DRAFT', 'PLANNED', 'UPCOMING'].includes(trip.status.toUpperCase()) && (
                  <Button 
                    onClick={async () => {
                      try {
                        await tripService.updateTripStatus(trip.id, 'CONFIRMED');
                        toast.success("Itinerary confirmed successfully!", {
                          description: "Your adventure is locked in!"
                        });
                        fetchTripData();
                      } catch (err: any) {
                        toast.error(err.response?.data?.error || err.message || "Failed to confirm itinerary.");
                      }
                    }}
                    className="h-14 rounded-2xl px-8 font-black text-lg gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl shadow-emerald-600/40 border border-emerald-500/20"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Confirm Itinerary
                  </Button>
                )}
                <Button 
                    onClick={async () => {
                        try {
                            await tripService.updateTripStatus(trip.id, 'ONGOING');
                            toast.success("Life is a journey! Starting now.");
                            router.push(`/dashboard/trips/${trip.id}/days/1`);
                        } catch (err: any) {
                            toast.error("Failed to start journey.");
                        }
                    }}
                    className="h-14 rounded-2xl px-8 font-black text-lg gap-2 shadow-2xl shadow-primary/40 group"
                >
                  <Navigation className="h-5 w-5 group-hover:animate-pulse" />
                  Start Journey
                </Button>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <Section className="-mt-12 relative z-10">
        <TripQuickFeatures tripId={trip.id} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Itinerary */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-heading">Trip Itinerary</h2>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-3 py-1 rounded-full">
                {trip.tripDays?.length || 0} Days Plan
              </div>
            </div>

            <div className="space-y-4">
              {trip.tripDays?.map((dayPlan, idx: number) => (
                <motion.div
                  key={dayPlan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={`/dashboard/trips/${trip.id}/days/${dayPlan.dayNumber}`}>
                    <Card className="group border-none ring-1 ring-border/50 hover:ring-primary/40 shadow-sm hover:shadow-xl hover:translate-x-2 transition-all duration-300 overflow-hidden bg-background/50 backdrop-blur-sm">
                      <div className="flex items-stretch h-32 sm:h-40">
                        <div 
                          className="w-32 sm:w-48 shrink-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1626082866714-28b14e57989a?w=800&q=80')` }}
                        />
                        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">
                                Day {dayPlan.dayNumber} • {new Date(dayPlan.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                              <h3 className="text-xl sm:text-2xl font-bold font-heading group-hover:text-primary transition-colors">
                                {trip.itineraryDays?.find(d => d.dayNumber === dayPlan.dayNumber)?.destination?.name || trip.destination.name} exploration
                              </h3>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {dayPlan.itineraryItems && dayPlan.itineraryItems.length > 0 ? (
                              dayPlan.itineraryItems.slice(0, 2).map((item: any) => (
                                <span key={item.id} className="text-[10px] sm:text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                  {item.travelSpot?.name || "Activity"}
                                </span>
                              ))
                            ) : (
                                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full italic">
                                  No activities added yet
                                </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* AI Doubt Chat Assistant */}
            <div className="mt-8">
              <ItemChatSection 
                itemId={trip.id} 
                itemType="trip" 
                itemName={trip.title} 
                theme="light" 
                suggestions={[
                  "Can you summarize my itinerary?",
                  "Are there any gaps in my schedule?",
                  "What is the best way to travel between these spots?",
                  "Suggest some offbeat places to add to this trip."
                ]}
              />
            </div>
          </div>

          {/* Sidebar Info & Map */}
          <div className="space-y-8">
            <Card className="border-none ring-1 ring-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <MapIcon className="h-5 w-5 text-primary" />
                  Route Preview
                </CardTitle>
                <CardDescription>Visualizing your {destinationNames} quest.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 relative">
                  <MapRoute locations={uniqueMapLocations} className="h-full w-full shadow-inner ring-1 ring-border/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none ring-1 ring-border/50 shadow-sm bg-background/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Your Journey to Destination
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {trip.startDetails ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        {trip.startDetails.mode === 'flight' && <Plane className="h-6 w-6 text-primary" />}
                        {trip.startDetails.mode === 'train' && <TrainFront className="h-6 w-6 text-primary" />}
                        {trip.startDetails.mode === 'bus' && <Bus className="h-6 w-6 text-primary" />}
                        {trip.startDetails.mode === 'car' && <Car className="h-6 w-6 text-primary" />}
                      </div>
                      <div>
                        <div className="font-black text-sm uppercase tracking-tight">
                          {trip.startDetails.mode} from {trip.startDetails.fromLocation}
                        </div>
                        <div className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Arriving at {new Date(trip.startDetails.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsStartDetailsModalOpen(true)}
                      className="w-full rounded-xl font-bold border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      Edit Travel Details
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                      <Plane className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold">No travel details yet</div>
                      <p className="text-xs text-muted-foreground">Add how you're getting there to complete your trip plan.</p>
                    </div>
                    <Button 
                      onClick={() => setIsStartDetailsModalOpen(true)}
                      className="w-full rounded-xl font-bold shadow-lg shadow-primary/20"
                    >
                      Add Travel Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none ring-1 ring-border/50 shadow-sm bg-background/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ArrowLeft className="h-5 w-5 text-primary rotate-180" />
                  Return Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {trip.endDetails ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        {trip.endDetails.mode === 'flight' && <Plane className="h-6 w-6" />}
                        {trip.endDetails.mode === 'train' && <TrainFront className="h-6 w-6" />}
                        {trip.endDetails.mode === 'bus' && <Bus className="h-6 w-6" />}
                        {trip.endDetails.mode === 'car' && <Car className="h-6 w-6" />}
                      </div>
                      <div>
                        <div className="font-black text-sm capitalize tracking-tight">
                          {trip.endDetails.mode} to {trip.endDetails.toLocation}
                        </div>
                        <div className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Departs at {new Date(trip.endDetails.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsReturnDetailsModalOpen(true)}
                      className="w-full rounded-xl font-bold border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      Edit
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                      <ArrowLeft className="h-6 w-6 text-muted-foreground rotate-180" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold">No return plan yet</div>
                      <p className="text-xs text-muted-foreground">Add your return journey details to finish the trip cycle.</p>
                    </div>
                    <Button 
                      onClick={() => setIsReturnDetailsModalOpen(true)}
                      className="w-full rounded-xl font-bold shadow-lg shadow-primary/20"
                    >
                      Add Return Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none ring-1 ring-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
                    <Clock className="h-4 w-4 text-primary mb-1" />
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Status</div>
                    <div className="text-sm font-bold">{trip.status}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
                    <MapPin className="h-4 w-4 text-primary mb-1" />
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Location</div>
                    <div className="text-sm font-bold truncate" title={destinationNames}>{destinationNames}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </Section>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        tripUrl={typeof window !== 'undefined' ? `${window.location.origin}/dashboard/trips/${trip.id}` : ''}
        tripTitle={trip.title}
        tripId={trip.id}
      />

      <StartDetailsModal
        isOpen={isStartDetailsModalOpen}
        onClose={() => setIsStartDetailsModalOpen(false)}
        tripId={trip.id}
        initialData={trip.startDetails}
        onSuccess={fetchTripData}
      />

      <ReturnDetailsModal
        isOpen={isReturnDetailsModalOpen}
        onClose={() => setIsReturnDetailsModalOpen(false)}
        tripId={trip.id}
        initialData={trip.endDetails}
        onSuccess={fetchTripData}
      />
    </div>
  );
}
