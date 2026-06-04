"use client";

import { useState, useEffect } from 'react';
import apiClient from '@/services/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, ShieldCheck, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ApiTestPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/health');
      setHealth(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to API');
    } finally {
      setHealth((prev: any) => prev || { status: 'error' }); // Ensure we have something to show
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="bg-slate-900 p-10 text-white relative h-48 flex flex-col justify-end">
             <div className="absolute top-0 right-0 p-10">
                <Badge className={cn(
                  "px-4 py-1.5 rounded-xl border-none font-black text-[10px] tracking-widest uppercase animate-pulse",
                  health?.status === 'ok' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                )}>
                  {loading ? 'Testing...' : health?.status === 'ok' ? 'System Online' : 'System Offline'}
                </Badge>
             </div>
             <CardTitle className="text-4xl font-black italic tracking-tighter flex items-center gap-4">
                <Activity className="h-8 w-8 text-sky-400" />
                Connectivity <span className="text-sky-400">Diagnostic.</span>
             </CardTitle>
             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">API Connection Probe v1.0</p>
          </CardHeader>
          
          <CardContent className="p-10 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Column */}
                <div className="space-y-6">
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-sky-200 transition-all">
                      <div className="flex items-center gap-4 mb-2">
                         <ShieldCheck className="h-5 w-5 text-emerald-500" />
                         <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Base API URL</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 break-all">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}</p>
                   </div>
                   
                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-sky-200 transition-all">
                      <div className="flex items-center gap-4 mb-2">
                         <Database className="h-5 w-5 text-sky-500" />
                         <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">DB Connectivity</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                         {loading ? 'Checking...' : health?.database === 'connected' ? 'Established' : 'Failed'}
                      </p>
                   </div>
                </div>

                {/* Raw Response Column */}
                <div className="p-8 bg-slate-900 rounded-[2rem] text-sky-400 font-mono text-xs overflow-auto max-h-[220px] shadow-inner">
                   <div className="flex items-center justify-between mb-4 border-b border-sky-400/20 pb-4">
                      <span className="text-white font-bold tracking-widest uppercase text-[10px]">Raw JSON Payload</span>
                   </div>
                   {loading ? (
                     <div className="flex items-center gap-2 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        <span>Awaiting stream...</span>
                     </div>
                   ) : error ? (
                     <div className="text-rose-400 flex items-start gap-4 p-4 bg-rose-400/10 rounded-xl">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span className="font-bold leading-relaxed">{error}</span>
                     </div>
                   ) : (
                     <pre className="whitespace-pre-wrap">{JSON.stringify(health, null, 2)}</pre>
                   )}
                </div>
             </div>

             <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                   Next.js x Axios Centralized Service Layer
                </p>
                <Button 
                   onClick={checkHealth} 
                   disabled={loading}
                   className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black hover:scale-105 transition-all shadow-2xl disabled:opacity-50"
                >
                   {loading ? (
                     <RefreshCw className="h-5 w-5 animate-spin" />
                   ) : 'Retest Connection'}
                </Button>
             </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
