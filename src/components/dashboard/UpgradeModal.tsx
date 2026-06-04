'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, ShieldCheck, Infinity, Clock } from 'lucide-react';
import { subscriptionService } from '@/services/subscription.service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UpgradeModal({ isOpen, onClose, onSuccess }: UpgradeModalProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      onClose();
      router.push('/dashboard/checkout');
    } catch (error: any) {
      toast.error('Upgrade redirect failed.');
    } finally {
      setLoading(false);
    }
  };

  const proFeatures = [
    { icon: Infinity, text: 'Unlimited active trips' },
    { icon: Sparkles, text: 'Unlimited AI generation' },
    { icon: Clock, text: 'Early access to new features' },
    { icon: ShieldCheck, text: 'Priority support' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[2rem]">
        <div className="bg-slate-900 text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="h-40 w-40 text-sky-400" />
          </div>
          <Badge className="bg-sky-500 hover:bg-sky-600 text-white border-none font-black px-3 py-1 rounded-lg mb-4">
            LIMITED TIME OFFER
          </Badge>
          <DialogTitle className="text-4xl font-black font-heading italic tracking-tighter leading-none mb-2">
            Elevate Your <span className="text-sky-400">Journey</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Unlock the full power of Travenic
          </DialogDescription>
        </div>

        <div className="p-8 bg-white">
          <div className="space-y-6 mb-10">
            {proFeatures.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                  <feature.icon className="h-5 w-5 text-sky-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">{feature.text}</p>
                </div>
                <Check className="h-5 w-5 text-emerald-500" />
              </motion.div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
            <div className="flex items-end justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Travenic Pro</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">₹499<span className="text-sm font-medium text-slate-400">/year</span></p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black px-2 py-1 rounded-md">
                60% OFF
              </Badge>
            </div>
          </div>

          <Button 
            className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-sky-600 transition-all shadow-xl shadow-slate-900/20 group"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? 'Processing...' : (
              <span className="flex items-center gap-2">
                Get Pro Access Now
                <Zap className="h-4 w-4 fill-amber-400 text-amber-400 group-hover:scale-125 transition-transform" />
              </span>
            )}
          </Button>
          <p className="text-center text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">
            30-day money-back guarantee • Secure payment
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
