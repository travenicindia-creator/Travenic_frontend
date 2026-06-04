"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { forgotPassword } from "@/services/features.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="border-none shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              {sent ? <CheckCircle className="h-8 w-8 text-emerald-500" /> : <Mail className="h-8 w-8 text-primary" />}
            </div>
            <CardTitle className="text-2xl font-black font-heading">
              {sent ? "Check Your Email" : "Forgot Password?"}
            </CardTitle>
            <CardDescription>
              {sent
                ? `We've sent a reset link to ${email}. Check your inbox (and spam folder).`
                : "No worries, we'll send you a password reset link."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-muted/30 border-none"
                  required
                />
                {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-bold">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center w-full h-12 rounded-xl font-bold border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                Back to Login
              </Link>
            )}
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
