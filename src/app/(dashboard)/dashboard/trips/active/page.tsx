"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tripService } from "@/services/trip.service";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Section } from "@/components/ui/section";

export default function ActiveTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveTrip = async () => {
      try {
        const data = await tripService.getActiveTrip();
        if (data.trip) {
          router.replace(`/dashboard/trips/${data.trip.id}`);
        } else {
          setError("No active trip found.");
        }
      } catch (err: any) {
        setError(err.response?.status === 404 ? "You don't have an active journey right now." : "Failed to load active trip.");
      } finally {
        setLoading(false);
      }
    };
    fetchActiveTrip();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Section className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2 font-heading">No Active Journey</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        {error || "Your quest hasn't started yet. Ready to launch your next adventure?"}
      </p>
      <div className="flex gap-4">
        <Link href="/dashboard/trips">
          <Button variant="outline" className="rounded-xl h-12 px-8 font-bold">My Trips</Button>
        </Link>
        <Link href="/dashboard/create">
          <Button className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20">Create Trip</Button>
        </Link>
      </div>
    </Section>
  );
}
