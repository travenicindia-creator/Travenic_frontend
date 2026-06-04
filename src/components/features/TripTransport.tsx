"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Loader2, 
  Car, 
  LayoutGrid
} from "lucide-react";
import { getTripTransport, TransportDetails } from "@/services/features.service";
import { TransportMarketplace } from "./TransportMarketplace";

export function TripTransport({ tripId }: { tripId: string }) {
  const [data, setData] = useState<TransportDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [tripId]);

  const loadData = async () => {
    try {
      const res = await getTripTransport(tripId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <Card className="border-none ring-1 ring-border/50 shadow-sm bg-background/50 backdrop-blur-sm min-h-[500px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="border-none ring-1 ring-border/50 shadow-sm bg-background/50 backdrop-blur-sm flex flex-col h-[650px] overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/30 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Car className="h-6 w-6 text-primary" />
              Local Transport
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">
              Marketplace & Booking Manager
            </CardDescription>
          </div>
          
          <div className="flex bg-muted/40 p-1 rounded-xl ring-1 ring-border/50">
            <div className="px-4 py-1.5 rounded-lg text-xs font-bold bg-background shadow-sm text-primary flex items-center gap-2">
              <LayoutGrid className="h-3.5 w-3.5" />
              Marketplace
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <TransportMarketplace tripId={tripId} onSelect={loadData} />
      </CardContent>
    </Card>
  );
}
