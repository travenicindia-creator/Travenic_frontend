"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle2, ChevronRight, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { tripService } from "@/services/trip.service";
import Link from "next/link";
import { useAuthStore } from "@/store/use-auth-store";

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [tripId, setTripId] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      toast.info("Please log in or sign up to join this trip!");
      // Save token to localstorage or redirect with query so they can accept after login
      localStorage.setItem('pending_invite_token', token);
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const res = await tripService.acceptInvite(token);
      toast.success("Successfully joined the trip!");
      setAccepted(true);
      setTripId(res.tripId);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to accept invite.");
    } finally {
      setLoading(false);
    }
  };

  // If user logs in and still has the token in localstorage
  useEffect(() => {
    if (isAuthenticated) {
       const pendingToken = localStorage.getItem('pending_invite_token');
       if (pendingToken === token) {
           handleAccept();
           localStorage.removeItem('pending_invite_token');
       }
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80')] bg-cover bg-center opacity-10 grayscale" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 group">
           <div className="bg-primary text-primary-foreground p-2 rounded-xl rotate-3 group-hover:rotate-0 transition-all font-black text-xl italic font-heading">
             Tr
           </div>
           <span className="font-black text-3xl tracking-tight text-foreground italic font-heading">Travenic</span>
        </Link>
        <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-background/50 backdrop-blur-xl">
          <CardContent className="p-8 sm:p-10 flex flex-col items-center text-center">
            
            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
               <Users className="h-10 w-10 text-primary" />
            </div>
            
            <h1 className="text-3xl font-black font-heading mb-3 text-foreground">
              {accepted ? "You're In!" : "You've been invited!"}
            </h1>
            <p className="text-muted-foreground font-medium mb-8">
              {accepted 
               ? "You are now a collaborator on this trip. Get ready for the adventure."
               : "Someone wants you to join their trip and help plan the adventure of a lifetime."}
            </p>

            {accepted ? (
              <Button 
                onClick={() => router.push(`/dashboard/trips/${tripId}`)}
                className="w-full h-14 rounded-2xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 text-lg group shadow-lg shadow-primary/25"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
               <Button 
                onClick={handleAccept}
                disabled={loading}
                className="w-full h-14 rounded-2xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 text-lg group shadow-lg shadow-primary/25"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                {isAuthenticated ? "Accept Invitation" : "Log in to Accept"}
              </Button>
            )}

          </CardContent>
        </Card>
        
        <p className="text-center text-sm font-medium text-muted-foreground mt-8">
            Travenic powers the world's most epic group travels.
        </p>
      </motion.div>
    </div>
  );
}
