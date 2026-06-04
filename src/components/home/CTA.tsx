'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Plane } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] bg-foreground p-12 sm:p-20 text-center overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center mb-8">
              <Plane className="h-8 w-8 text-primary fill-primary" />
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold font-heading text-white mb-6">
              Ready to plan your <br />
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent italic underline underline-offset-8">next system?</span>
            </h2>

            <p className="text-lg text-white/60 mb-10 leading-relaxed font-medium">
              Join thousands of travelers who are optimizing their journeys with Travenic. Your perfect trip is just a few clicks away.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Link
                href="/dashboard/create"
                className={cn(buttonVariants({ size: "lg" }), "h-14 rounded-2xl px-10 text-base font-bold bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 border-none group")}
              >
                Start Planning Today
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="h-14 rounded-2xl px-10 text-base font-bold text-white border border-white/20 hover:bg-white/5 backdrop-blur-sm transition-all">
                Talk to Sales
              </button>
            </div>

            <p className="mt-8 text-xs font-bold text-white/30 uppercase tracking-[0.2em]">
              No credit card required • Free for individuals
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
