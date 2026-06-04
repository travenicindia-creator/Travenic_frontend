"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShieldCheck, Star, X, CheckCircle2, ArrowRight, IndianRupee } from "lucide-react";
import { paymentService } from "@/services/payment.service";

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PremiumUpgradeModal({ isOpen, onClose, onSuccess }: PremiumUpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePayment = async (type: 'slot' | 'pro') => {
    try {
      setLoading(type);
      const orderData = type === 'slot' 
        ? await paymentService.createSlotOrder() 
        : await paymentService.createPlanOrder();

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Travenic Premium",
        description: type === 'slot' ? "Extra Itinerary Slot" : "Lifetime Pro Plan",
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            onSuccess();
          } catch (err) {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      const msg = error.message || "Failed to initiate payment.";
      alert(`Error: ${msg}\n\nPlease try again or contact support.`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col md:flex-row h-full">
              {/* Left Side: Illustration & Hook */}
              <div className="md:w-5/12 bg-indigo-600 p-8 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                    <Zap className="h-6 w-6 text-white fill-white" />
                  </div>
                  <h2 className="text-3xl font-black mb-4 leading-tight">Unlock Infinite Horizons</h2>
                  <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                    Don't let limits hold your wanderlust back. Explore more with Travenic Pro.
                  </p>
                </div>

                <div className="relative z-10 space-y-4 mt-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-300" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Unlimited Trips</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-300" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">AI Priority Queue</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-300" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Exclusive Stays</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Options */}
              <div className="flex-1 p-8 md:p-10 bg-slate-50">
                <h3 className="text-xl font-black text-slate-800 mb-6">Choose Your Path</h3>
                
                <div className="space-y-4">
                  {/* Option 1: Extra Slot */}
                  <div 
                    className="bg-white border-2 border-slate-200 rounded-3xl p-5 cursor-pointer hover:border-indigo-400 transition-all group relative overflow-hidden"
                    onClick={() => handlePayment('slot')}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">One-Time Pack</p>
                        <h4 className="text-lg font-black text-slate-800">+1 Itinerary Slot</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-indigo-600 flex items-center justify-end">
                          <IndianRupee className="h-4 w-4" /> 199
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">PER SLOT</p>
                      </div>
                    </div>
                    {loading === 'slot' && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                      </div>
                    )}
                  </div>

                  {/* Option 2: Pro Plan */}
                  <div 
                    className="bg-white border-2 border-indigo-600 rounded-3xl p-5 cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden"
                    onClick={() => handlePayment('pro')}
                  >
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
                      Best Value
                    </div>
                    <div className="flex items-center justify-between relative z-10 pt-2">
                      <div>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Lifetime Pass</p>
                        <h4 className="text-lg font-black text-slate-800">Travenic Pro</h4>
                        <p className="text-[10px] font-medium text-slate-500 mt-1">Unlimited AI Itineraries Forever</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-indigo-600 flex items-center justify-end">
                          <IndianRupee className="h-5 w-5" /> 999
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">ONE TIME</p>
                      </div>
                    </div>
                    {loading === 'pro' && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => handlePayment('pro')}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 group"
                  >
                    Go Pro Now
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-4 font-medium flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" />
                    Secure Payment via Razorpay
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
