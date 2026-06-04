'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading mb-2">Welcome back</h1>
        <p className="text-muted-foreground font-medium">Please enter your details to sign in.</p>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-destructive">{error}</p>
              <div className="flex items-center gap-3 mt-1">
                <button 
                  onClick={clearError}
                  className="text-xs font-bold text-destructive/60 hover:text-destructive underline"
                >
                  Dismiss
                </button>
                {error.toLowerCase().includes('verify') && (
                  <button 
                    onClick={async () => {
                      try {
                        const { resendVerification } = useAuthStore.getState();
                        await resendVerification(email);
                        toast.success('Verification email resent!');
                        clearError();
                      } catch (err) {
                        toast.error('Failed to resend email');
                      }
                    }}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Resend Email
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground" htmlFor="email">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="pl-10 h-12 rounded-xl border-border/50 focus:ring-primary/20 transition-all font-medium"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) clearError();
              }}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground" htmlFor="password">
              Password
            </label>
            <Link href="/forgot-password" title="Forgot password?" className="text-xs font-bold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10 h-12 rounded-xl border-border/50 focus:ring-primary/20 transition-all"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) clearError();
              }}
              required
            />
          </div>
        </div>

        <div className="pt-2">
          <Button 
            className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/10" 
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </div>
      </form>

      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4 w-full">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">or</span>
          <div className="h-px bg-border flex-1" />
        </div>
        
        <div className="w-full flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (credentialResponse.credential) {
                try {
                  const { loginWithGoogle } = useAuthStore.getState();
                  await loginWithGoogle(credentialResponse.credential);
                  toast.success('Google Login Successful');
                  router.push('/dashboard');
                } catch (err) {
                  // Error handled by store
                }
              }
            }}
            onError={() => {
              toast.error('Google Login Failed');
            }}
            useOneTap
            theme="filled_blue"
            shape="pill"
            width="100%"
          />
        </div>
      </div>

      <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
        Don't have an account?{' '}
        <Link href="/signup" className="text-primary font-bold hover:underline">
          Sign up for free
        </Link>
      </p>
    </motion.div>
  );
}
