"use client";

import { Button } from "@/components/ui/button";
import { 
  ListChecks, 
  Wallet, 
  NotebookPen,
  Car
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TripChecklist } from "./TripChecklist";
import { TripBudget } from "./TripBudget";
import { TripNotes } from "./TripNotes";
import { TripTransport } from "./TripTransport";
import { cn } from "@/lib/utils";

interface TripQuickFeaturesProps {
  tripId: string;
}

export function TripQuickFeatures({ tripId }: TripQuickFeaturesProps) {
  const features = [
    {
      id: "checklist",
      label: "Packing Checklist",
      icon: ListChecks,
      component: TripChecklist,
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 shadow-blue-500/10"
    },
    {
      id: "budget",
      label: "Budget Tracker",
      icon: Wallet,
      component: TripBudget,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 shadow-emerald-500/10"
    },
    {
      id: "journal",
      label: "Travel Journal",
      icon: NotebookPen,
      component: TripNotes,
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 shadow-amber-500/10"
    },
    {
      id: "transport",
      label: "Local Transport",
      icon: Car,
      component: TripTransport,
      color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/20 shadow-indigo-500/10"
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 mb-10">
      {features.map((feature) => {
        const FeatureComponent = feature.component;
        return (
          <Dialog key={feature.id}>
            <DialogTrigger 
              render={
                <Button 
                  variant="outline" 
                  className={cn(
                    "h-14 rounded-2xl px-6 font-bold flex items-center gap-3 transition-all duration-300 border shadow-md hover:scale-105 active:scale-95",
                    feature.color
                  )}
                >
                  <feature.icon className="h-5 w-5" />
                  <span className="tracking-tight">{feature.label}</span>
                </Button>
              }
            />
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none bg-transparent shadow-2xl">
                <FeatureComponent tripId={tripId} />
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}
