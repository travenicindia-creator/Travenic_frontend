'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MapPin, Navigation } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Hero() {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 [background:radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-[0.03] blur-[100px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Content */}
          <div className="flex flex-col text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center self-start rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary"
            >
              <Navigation className="mr-2 h-3.5 w-3.5 fill-primary" />
              <span>Next-Gen Travel Planning</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 text-5xl font-extrabold tracking-tight sm:text-7xl font-heading text-foreground"
            >
              Plan your trips <br />
              <span className="text-primary-gradient">effortlessly.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-10 max-w-xl text-lg text-muted-foreground/80 sm:text-xl leading-relaxed"
            >
              Travenic helps you organize your journey day-by-day so you always know where to go and when. No more planning chaos.
            </motion.p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard/create"
                className={cn(buttonVariants({ size: "lg" }), "h-14 rounded-xl px-8 text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all border-none")}
              >
                Start Planning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Button size="lg" variant="outline" className="h-14 rounded-xl px-8 text-base font-bold border-border/50 hover:bg-background/50 backdrop-blur-sm">
                Explore Meghalaya
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-12 flex items-center gap-6"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted bg-cover bg-center" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}')` }} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Joined by <span className="text-foreground font-bold">2,000+</span> travelers this month
              </p>
            </motion.div>
          </div>

          {/* Right Column: Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative mx-auto rounded-3xl border border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl p-4 sm:p-6 overflow-hidden max-w-xl">
              <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Meghalaya Expedition</h4>
                    <p className="text-[10px] text-muted-foreground font-medium">Aug 12 - Aug 18 • 7 Days</p>
                  </div>
                </div>
                <div className="flex gap-1.5 font-bold text-[10px] uppercase tracking-tighter">
                  <span className="px-2 py-1 rounded bg-accent/50 text-accent-foreground">Shared</span>
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary">Active</span>
                </div>
              </div>

              {/* Mock Timeline */}
              <div className="space-y-6 relative ml-4">
                <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-transparent" />

                <TimelineItem
                  time="09:00 AM"
                  title="Elephant Falls Visit"
                  location="Shillong"
                  status="Completed"
                  active={false}
                />
                <TimelineItem
                  time="01:30 PM"
                  title="Lunch at Dylan's Café"
                  location="Laitumkhrah"
                  status="Next Up"
                  active={true}
                />
                <TimelineItem
                  time="04:00 PM"
                  title="Police Bazaar Stroll"
                  location="City Center"
                  status="Pending"
                  active={false}
                />
              </div>

              {/* Floating Map Card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-6 bottom-12 w-48 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-xl p-3 shadow-xl"
              >
                <div className="h-24 w-full rounded-lg bg-muted mb-2 overflow-hidden relative">
                  <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596422846543-75c6fc18a593?w=300&q=80')" }} />
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-bold text-foreground">Current Location</span>
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">Shillong, Meghalaya</p>
              </motion.div>
            </div>

            {/* Background blob */}
            <div className="absolute -z-10 -top-20 -right-20 h-96 w-96 bg-primary/10 rounded-full blur-[100px]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ time, title, location, status, active }: { time: string, title: string, location: string, status: string, active: boolean }) {
  return (
    <div className={`flex gap-4 items-start relative transition-all ${active ? 'scale-105 z-10' : 'opacity-70 scale-100'}`}>
      <div className={`mt-1.5 h-4 w-4 rounded-full border-2 ${active ? 'bg-primary border-primary shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]' : 'bg-background border-primary/50'} z-10 transition-colors`} />
      <div className={`flex-1 rounded-xl p-3 border ${active ? 'bg-primary/5 border-primary/20 shadow-lg' : 'bg-muted/30 border-transparent hover:border-border/30'} transition-all`}>
        <div className="flex justify-between items-start mb-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-primary">{time}</span>
          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>{status}</span>
        </div>
        <h5 className="text-sm font-bold text-foreground mb-1">{title}</h5>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-medium">{location}</span>
        </div>
      </div>
    </div>
  );
}
