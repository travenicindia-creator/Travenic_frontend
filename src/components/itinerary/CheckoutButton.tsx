'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { tripService } from '@/services/trip.service';
import { cartService } from '@/services/cart.service';
import { toast } from 'sonner';

interface CheckoutButtonProps {
  tripId: string;
  amount: number;
  hasActivities: boolean;
  onSuccess: () => void;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ tripId, amount, hasActivities, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Step 1: Load Script
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // Step 2: Use Cart Checkout
      const checkoutData = await cartService.checkout(tripId);
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_fLjLz0BJbniTcg',
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        name: 'Travenic',
        description: 'Trip Booking Payment',
        order_id: checkoutData.orderId,
        handler: async function (response: any) {
          try {
            await cartService.verifyPayment(tripId, response);
            toast.success('Payment Successful! Itinerary Confirmed.');
            onSuccess();
          } catch (err) {
            toast.error('Payment verification failed.');
          }
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || 'Confirmation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleConfirm}
      disabled={loading}
      className={`h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${
        hasActivities ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
      } text-white`}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          {hasActivities ? (
            <>
              <CreditCard className="h-5 w-5 mr-3" />
              Pay & Confirm Itinerary
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 mr-3" />
              Confirm Plan
            </>
          )}
          <ArrowRight className="h-4 w-4 ml-3 opacity-50" />
        </>
      )}
    </Button>
  );
};

export default CheckoutButton;
