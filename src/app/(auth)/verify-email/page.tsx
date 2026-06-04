'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { verifyEmail, resendVerification, isLoading, error, clearError } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        await verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };

    performVerification();
  }, [token, verifyEmail]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      {status === 'loading' && (
        <div className="space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
          <h1 className="text-3xl font-bold font-heading">Verifying your email</h1>
          <p className="text-muted-foreground font-medium">
            Please wait while we confirm your email address...
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold font-heading">Email Verified!</h1>
          <p className="text-muted-foreground font-medium">
            Your email has been successfully verified. You can now access all features of Travenic.
          </p>
          <Button 
            className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/10"
            onClick={() => router.push('/login')}
          >
            Sign in to your account
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold font-heading">Verification Failed</h1>
          <p className="text-muted-foreground font-medium">
            {error || "The verification link is invalid or has expired. Please try signing up again or contact support."}
          </p>
          <div className="space-y-4">
            <Button 
              className="w-full h-12 rounded-xl text-base font-bold"
              onClick={async () => {
                const email = window.prompt("Enter your email address to resend the verification link:");
                if (email) {
                  try {
                    await resendVerification(email);
                    toast.success("Verification email resent!");
                    router.push('/login');
                  } catch (err) {
                    toast.error("Failed to resend email. Please check the address.");
                  }
                }
              }}
            >
              Resend verification email
            </Button>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                className="h-12 rounded-xl text-base font-bold"
                onClick={() => router.push('/signup')}
                variant="outline"
              >
                Back to signup
              </Button>
              <Button 
                className="h-12 rounded-xl text-base font-bold"
                onClick={() => {
                  clearError();
                  router.push('/login');
                }}
                variant="outline"
              >
                Go to login
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-20">
        <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
