'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { XCircle, HelpCircle, ArrowLeft, RefreshCw, PhoneCall, AlertTriangle } from 'lucide-react';

export default function FailurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract payment details and error messages
  const errorMsg = searchParams.get('error') || 'The transaction was declined by the authentication gateway.';
  const productName = searchParams.get('product') || 'Lifetime PRO Nomad';

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-slate-50/30 relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl z-10"
      >
        <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-8 md:p-12 text-center relative overflow-hidden">
          
          {/* Top Banner Tag */}
          <div className="flex justify-center mb-6">
            <Badge className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Transaction Declined
            </Badge>
          </div>

          {/* Interactive X-Mark Animation */}
          <div className="relative h-28 w-28 mx-auto mb-8 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 bg-rose-500/10 rounded-full"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.1, 1] }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="absolute inset-2 bg-rose-500/20 rounded-full"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3, type: 'spring' }}
              className="z-10 text-rose-500"
            >
              <XCircle className="h-16 w-16 stroke-[1.5]" />
            </motion.div>
          </div>

          {/* Titles */}
          <h2 className="text-3xl md:text-4xl font-black font-heading italic tracking-tighter text-slate-900 mb-2">
            Payment <span className="text-rose-500">Unsuccessful.</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">
            The transaction could not be processed completely
          </p>

          {/* Details Box */}
          <CardContent className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-left mb-8 space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider block mb-1">Target Product Upgrade</span>
              <span className="text-sm font-black text-slate-800">{productName}</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider block mb-1">Error Explanation</span>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl select-all">
                {errorMsg}
              </p>
            </div>
          </CardContent>

          {/* Guidelines */}
          <div className="text-left text-xs font-semibold text-slate-400 leading-relaxed mb-8 space-y-2">
            <p className="font-black text-[9px] uppercase tracking-wider text-slate-300">How to resolve this issue:</p>
            <div className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0" />
              <span>Verify that you have sufficient funds or your card limits are correctly configured.</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0" />
              <span>Make sure your internet connection is stable and the 3D-Secure transaction wasn&apos;t closed prematurely.</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => router.push('/dashboard/checkout')}
              className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-[0.2em] transition-all group shadow-xl shadow-slate-900/10 gap-2"
            >
              <RefreshCw className="h-4 w-4 group-hover:rotate-45 transition-transform" />
              Retry Checkout
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="flex-1 h-14 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-black text-xs uppercase tracking-[0.2em] transition-all gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard Home
            </Button>
          </div>

          {/* Support call line */}
          <p className="text-center text-[10px] text-slate-400 font-bold mt-8 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <PhoneCall className="h-3 w-3 text-sky-400" />
            Need help? Contact support@travenic.com for manual checkout processing
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
