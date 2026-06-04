"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2, Users, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { tripService } from "@/services/trip.service";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripUrl: string;
  tripTitle: string;
  tripId: string;
}

export function ShareModal({ isOpen, onClose, tripUrl, tripTitle, tripId }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'link' | 'invite'>('link');
  const [inviteUrl, setInviteUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const generateInvite = async () => {
    try {
      setIsGenerating(true);
      const res = await tripService.generateInviteLink(tripId, 'EDITOR');
      setInviteUrl(res.inviteUrl);
      toast.success("Invite link generated!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to generate invite link.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black font-heading italic">Share your Itinerary</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Spread the joy of your "{tripTitle}" adventure with others!
          </DialogDescription>
        </DialogHeader>

        {/* Custom Tabs Navigation */}
        <div className="flex bg-muted rounded-xl p-1 mb-4">
            <button 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'link' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setTab('link')}
            >
                Public Link
            </button>
            <button 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${tab === 'invite' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setTab('invite')}
            >
                <Users className="w-4 h-4" />
                Collaborators
            </button>
        </div>

        {tab === 'link' && (
          <>
            <div className="flex items-center space-x-2 py-2">
              <div className="grid flex-1 gap-2">
                <label htmlFor="link" className="sr-only">Link</label>
                <Input
                  id="link"
                  defaultValue={tripUrl}
                  readOnly
                  className="h-12 bg-muted/30 border-none font-medium px-4 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              <Button type="button" size="sm" className="px-3 h-12 rounded-xl px-6 font-bold" onClick={() => handleCopy(tripUrl)}>
                <span className="sr-only">Copy</span>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 pb-4">
                <Button variant="outline" className="h-12 rounded-2xl font-bold gap-2 border-2" onClick={() => toast.info("Sharing to community coming soon!")}>
                    <Share2 className="h-4 w-4" />
                    Community
                </Button>
                <Button variant="outline" className="h-12 rounded-2xl font-bold gap-2 border-2" onClick={() => handleCopy(tripUrl)}>
                    <Copy className="h-4 w-4" />
                    Copy Link
                </Button>
            </div>
          </>
        )}

        {tab === 'invite' && (
           <div className="space-y-4 py-2">
             <div className="bg-primary/5 text-primary p-4 rounded-xl text-sm font-medium border border-primary/10">
                Generate a secure, private invite link. Anyone with this link can join this trip and collaboratively edit the itinerary!
             </div>

             {!inviteUrl ? (
                <Button 
                    className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20" 
                    onClick={generateInvite}
                    disabled={isGenerating}
                >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Wand2 className="w-5 h-5 mr-2" />}
                    Generate Invite Link
                </Button>
             ) : (
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-2">
                    <Input
                      id="inviteLink"
                      defaultValue={inviteUrl}
                      readOnly
                      className="h-12 bg-muted/30 border-none font-medium px-4 focus-visible:ring-2 focus-visible:ring-primary/20"
                    />
                  </div>
                  <Button type="button" size="sm" className="px-3 h-12 rounded-xl px-6 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white border-0" onClick={() => handleCopy(inviteUrl)}>
                    <span className="sr-only">Copy</span>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
             )}
             {inviteUrl && (
                 <p className="text-xs text-muted-foreground text-center font-medium mt-2 pb-2">
                     *This link expires in 7 days and only works for new users not currently on this trip.
                 </p>
             )}
           </div>
        )}

        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-xl font-bold">
             Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
