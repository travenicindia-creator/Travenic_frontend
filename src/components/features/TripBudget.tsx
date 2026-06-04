"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign, Wallet, Activity, ArrowRight, Edit2, Check } from "lucide-react";
import { getTripBudget, updateTripBudget, BudgetData } from "@/services/features.service";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function TripBudget({ tripId }: { tripId: string }) {
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState("");

  const loadData = async () => {
    try {
      const res = await getTripBudget(tripId);
      setData(res);
      setNewBudget(res.budget.toString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tripId]);

  const handleUpdate = async () => {
    const val = parseFloat(newBudget);
    if (isNaN(val) || val < 0) {
      toast.error("Invalid budget amount");
      return;
    }
    
    try {
      setLoading(true);
      await updateTripBudget(tripId, val);
      await loadData();
      setIsEditing(false);
      toast.success("Budget updated");
    } catch (err) {
      toast.error("Failed to update budget");
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <Card className="border-none ring-1 ring-border/50 shadow-sm bg-background/50 backdrop-blur-sm min-h-[250px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </Card>
    );
  }

  if (!data) return null;

  const isOverBudget = data.percentage > 100;

  return (
    <Card className="border-none ring-1 ring-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Wallet className="h-5 w-5 text-primary" />
             Budget Tracker
          </div>
          {isEditing ? (
             <div className="flex items-center gap-2">
               <Input 
                 type="number" 
                 value={newBudget} 
                 onChange={e => setNewBudget(e.target.value)}
                 className="h-8 w-24 text-sm"
               />
               <Button size="sm" onClick={handleUpdate} className="h-8 w-8 p-0"><Check className="h-4 w-4" /></Button>
             </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
               ₹{data.budget} <Edit2 className="h-3 w-3" />
            </button>
          )}
        </CardTitle>
        <CardDescription>Track your estimated expenses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-2">
           <div className="flex justify-between items-end">
             <div>
               <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Spent</div>
               <div className="text-2xl font-black font-heading tracking-tight">₹{data.spent.total.toLocaleString()}</div>
             </div>
             <div className="text-right">
               <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Remaining</div>
               <div className={`text-sm font-bold ${isOverBudget ? 'text-destructive' : 'text-emerald-500'}`}>
                 {isOverBudget ? '-' : ''}₹{Math.abs(data.budget - data.spent.total).toLocaleString()}
               </div>
             </div>
           </div>

           <div className="w-full bg-muted rounded-full h-2 overflow-hidden flex">
             <motion.div 
               className={`h-full ${isOverBudget ? 'bg-destructive' : 'bg-primary'}`}
               initial={{ width: 0 }}
               animate={{ width: `${Math.min(data.percentage, 100)}%` }}
             />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
             <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Activities</div>
             <div className="text-sm font-bold">₹{data.spent.activities.toLocaleString()}</div>
           </div>
           <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
             <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Entry Fees</div>
             <div className="text-sm font-bold">₹{data.spent.entryFees.toLocaleString()}</div>
           </div>
        </div>

      </CardContent>
    </Card>
  );
}
