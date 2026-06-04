"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { resetPassword } from "@/services/features.service";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    setError("");

    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive font-bold">Invalid reset link. Please request a new one.</p>
        <Link 
          href="/forgot-password"
          className="inline-flex items-center justify-center mt-4 h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors"
        >
          Request Reset Link
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="border-none shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              {success ? <CheckCircle className="h-8 w-8 text-emerald-500" /> : <Lock className="h-8 w-8 text-primary" />}
            </div>
            <CardTitle className="text-2xl font-black font-heading">
              {success ? "Password Reset!" : "Set New Password"}
            </CardTitle>
            <CardDescription>
              {success ? "Redirecting to login..." : "Enter your new password below."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl bg-muted/30 border-none" required />
                <Input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-12 rounded-xl bg-muted/30 border-none" required />
                {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-bold">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
