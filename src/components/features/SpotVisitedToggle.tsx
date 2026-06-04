"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, MapPinOff, Loader2 } from "lucide-react";
import { toggleSpotVisit, getTripProgress } from "@/services/features.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SpotVisitedToggleProps {
  spotId: string;
  tripId?: string;
  tripDayId?: string;
  initialVisited?: boolean;
}

export function SpotVisitedToggle({ spotId, tripId, tripDayId, initialVisited = false }: SpotVisitedToggleProps) {
  const [visited, setVisited] = useState(initialVisited);
  const [loading, setLoading] = useState(false);

  // Note: ideally initialVisited is passed down. For now, we allow internal toggle state and rely on initialVisited if provided.
  useEffect(() => {
    setVisited(initialVisited);
  }, [initialVisited]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent triggering parent Links
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    try {
      const res = await toggleSpotVisit(spotId, tripId, tripDayId);
      setVisited(res.visited);
      toast.success(res.visited ? "Marked as visited!" : "Removed from visited.");
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "h-8 rounded-lg text-xs font-bold transition-all shadow-sm",
        visited 
          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20" 
          : "bg-background text-muted-foreground hover:text-primary hover:border-primary/50"
      )}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : visited ? (
        <>
          <MapPin className="h-3.5 w-3.5 mr-1" /> Visited
        </>
      ) : (
        <>
           <MapPinOff className="h-3.5 w-3.5 mr-1" /> Mark Visited
        </>
      )}
    </Button>
  );
}
