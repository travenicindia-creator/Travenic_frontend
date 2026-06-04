"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, NotebookPen, MessageSquarePlus, Trash2, Calendar } from "lucide-react";
import { getTripNotes, createTripNote, deleteTripNote, TripNote } from "@/services/features.service";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function TripNotes({ tripId }: { tripId: string }) {
  const [notes, setNotes] = useState<TripNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadNotes = async () => {
    try {
      const data = await getTripNotes(tripId);
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [tripId]);

  const handleAdd = async () => {
    if (!newContent.trim()) return;
    setSubmitting(true);
    try {
      await createTripNote(tripId, { content: newContent });
      await loadNotes();
      setNewContent("");
      setIsAdding(false);
      toast.success("Note added");
    } catch (err) {
      toast.error("Failed to add note");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setNotes(prev => prev.filter(n => n.id !== id));
      await deleteTripNote(id);
      toast.success("Note deleted");
    } catch (err) {
      toast.error("Failed to delete note");
      loadNotes(); // revert
    }
  };

  return (
    <Card className="border-none ring-1 ring-border/50 shadow-sm bg-background/50 backdrop-blur-sm flex flex-col h-full max-h-[500px]">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
             <NotebookPen className="h-5 w-5 text-primary" />
             Travel Journal
          </div>
          <Button size="sm" variant="ghost" onClick={() => setIsAdding(!isAdding)} className="h-8 w-8 p-0">
             <MessageSquarePlus className="h-4 w-4 text-muted-foreground" />
          </Button>
        </CardTitle>
        <CardDescription>Jot down memories or important details.</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-4 custom-scrollbar p-6 pt-0">
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <textarea 
                value={newContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewContent(e.target.value)}
                placeholder="What's on your mind?..."
                className="w-full resize-none h-24 mb-2 p-3 rounded-xl border border-border/50 bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button size="sm" onClick={handleAdd} disabled={!newContent.trim() || submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Note"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
           <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : notes.length === 0 ? (
           <div className="text-center text-sm text-muted-foreground italic py-12">No notes yet. Start journaling!</div>
        ) : (
           <div className="space-y-3">
             <AnimatePresence>
               {notes.map(note => (
                 <motion.div
                   key={note.id}
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="p-4 rounded-2xl bg-muted/30 border border-border/50 relative group"
                 >
                   <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-2">{note.content}</p>
                   <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                     <span className="flex items-center gap-1">
                       <Calendar className="h-3 w-3" />
                       {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                     </span>
                     <button onClick={() => handleDelete(note.id)} className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all">
                       <Trash2 className="h-4 w-4" />
                     </button>
                   </div>
                 </motion.div>
               ))}
             </AnimatePresence>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
