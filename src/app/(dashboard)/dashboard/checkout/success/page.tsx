'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Calendar, ClipboardCheck, ArrowRight, Sparkles, Navigation, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract transaction details
  const orderId = searchParams.get('orderId') || 'TRV-ORD-SANDBOX';
  const paymentId = searchParams.get('paymentId') || 'rzp_test_pay_sandbox';
  const productName = searchParams.get('product') || 'Lifetime PRO Nomad';
  const amountPaid = searchParams.get('amount') || '999';

  const [countdown, setCountdown] = React.useState(10);

  // Tick down timer for automated redirect
  React.useEffect(() => {
    if (countdown <= 0) {
      toast.info('Navigating back to main dashboard.');
      router.push('/dashboard');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-slate-50/30 relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl z-10"
      >
        <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-8 md:p-12 text-center relative overflow-hidden">
          
          {/* Top Banner Tag */}
          <div className="flex justify-center mb-6">
            <Badge className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Transaction Verified
            </Badge>
          </div>

          {/* Interactive Checkmark Animation */}
          <div className="relative h-28 w-28 mx-auto mb-8 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 bg-emerald-500/10 rounded-full"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.1, 1] }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="absolute inset-2 bg-emerald-500/20 rounded-full"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3, type: 'spring' }}
              className="z-10 text-emerald-500"
            >
              <CheckCircle2 className="h-16 w-16 stroke-[1.5]" />
            </motion.div>

            {/* Sparkle Micro-animations */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-2 -right-2 text-amber-400"
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
          </div>

          {/* Titles */}
          <h2 className="text-3xl md:text-4xl font-black font-heading italic tracking-tighter text-slate-900 mb-2">
            Payment <span className="text-emerald-500">Successful!</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">
            Your Travenic capabilities have been extended
          </p>

          {/* Details Box */}
          <CardContent className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-left mb-8 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Product Name</span>
              <span className="text-sm font-black text-slate-900">{productName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Amount Credited</span>
              <span className="text-sm font-black text-slate-900">₹{amountPaid}.00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Order Reference ID</span>
              <span className="text-xs font-semibold text-slate-500 select-all font-mono">{orderId}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Razorpay Payment ID</span>
              <span className="text-xs font-semibold text-slate-500 select-all font-mono">{paymentId}</span>
            </div>
          </CardContent>

          {/* Action buttons */}
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] transition-all group shadow-xl shadow-slate-900/10"
            >
              <span className="flex items-center justify-center gap-2">
                Continue to Dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>

            {/* Countdown loader overlay */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 mt-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Redirecting automatically in <span className="text-slate-950 font-black">{countdown}</span> seconds...
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
