"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, CheckCircle, Circle, Trash2, ListChecks } from "lucide-react";
import { getChecklist, addChecklistItem, toggleChecklistItem, deleteChecklistItem, ChecklistItem } from "@/services/features.service";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function TripChecklist({ tripId }: { tripId: string }) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadItems();
  }, [tripId]);

  const loadItems = async () => {
    try {
      const data = await getChecklist(tripId);
      setItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setAdding(true);
    try {
      const item = await addChecklistItem(tripId, newItem);
      setItems(prev => [...prev, item]);
      setNewItem("");
    } catch (err) {
      toast.error("Failed to add item");
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      setItems(prev => prev.map(i => i.id === id ? { ...i, isChecked: !current } : i));
      await toggleChecklistItem(id);
    } catch (err) {
      toast.error("Failed to update item");
      loadItems(); // revert
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setItems(prev => prev.filter(i => i.id !== id));
      await deleteChecklistItem(id);
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  const checkedCount = items.filter(i => i.isChecked).length;
  const progress = items.length ? Math.round((checkedCount / items.length) * 100) : 0;

  return (
    <Card className="border-none ring-1 ring-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
             <ListChecks className="h-5 w-5 text-primary" />
             Packing Checklist
          </div>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </CardTitle>
        <CardDescription>Keep track of essentials for your journey.</CardDescription>
        <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
          <motion.div 
            className="bg-primary h-1.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <Input 
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add an item... (e.g. Passports)"
            className="bg-muted/30 border-none"
            disabled={adding}
          />
          <Button type="submit" disabled={adding || !newItem.trim()} size="icon" className="shrink-0">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </form>

        {loading ? (
          <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
           <p className="text-center text-sm text-muted-foreground italic py-6">Your checklist is empty.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded-xl group transition-colors"
                >
                  <button onClick={() => handleToggle(item.id, item.isChecked)} className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                    {item.isChecked ? <CheckCircle className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5" />}
                  </button>
                  <span className={`text-sm flex-1 ${item.isChecked ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                    {item.item}
                  </span>
                  <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
