'use client';

import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Instagram, Map as MapIcon, StickyNote, XCircle } from 'lucide-react';

const chaosItems = [
  { icon: MapIcon, label: 'Google Maps Lists' },
  { icon: BookOpen, label: 'Countless Blogs' },
  { icon: StickyNote, label: 'Scattered Notes' },
  { icon: Instagram, label: 'Instagram Saves' },
];

export function ProblemSolution() {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Problem Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-6">
              Travel planning is <span className="text-destructive">broken.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Most travelers spend dozens of hours moving between tabs, losing track of their ideas and feeling overwhelmed before the trip even begins.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {chaosItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-destructive/10 bg-destructive/5 group hover:bg-destructive/10 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-destructive" />
                  </div>
                  <span className="text-sm font-bold text-foreground/80">{item.label}</span>
                  <XCircle className="ml-auto h-4 w-4 text-destructive/30" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Solution Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="p-8 sm:p-10 rounded-[2.5rem] bg-background border border-border/50 shadow-2xl relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-heading mb-6 text-foreground">
                Travenic brings <span className="text-primary-gradient">everything together.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We organize your scattered ideas into a clean, systematic itinerary. From booking to arrival, every detail has its place.
              </p>

              <ul className="space-y-4">
                {[
                  'Unified planning workspace',
                  'Automatic route optimization',
                  'Systematic day-by-day breakdown',
                  'Real-time collaborative updates'
                ].map((text, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground/80">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
