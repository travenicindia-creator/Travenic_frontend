'use client';

import { Compass } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-background relative overflow-hidden">
        {/* Subtle decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="w-full max-w-[400px] z-10">
          <Link href="/" className="flex items-center gap-2 mb-12 group">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground font-heading italic">Travenic</span>
          </Link>
          {children}
        </div>
      </div>

      {/* Visual Side */}
      <div className="hidden lg:flex relative bg-foreground overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596422846543-75c6fc18a593?w=1200&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-black/80" />
        
        <div className="relative z-10 max-w-md text-center">
          <h2 className="text-4xl font-bold text-white mb-6 font-heading">
            The world's first <br />
            <span className="text-primary-gradient italic underline underline-offset-8">systematic</span> travel planner.
          </h2>
          <p className="text-lg text-white/70 leading-relaxed font-medium">
            Join a community of travelers who value organization, exploration, and the perfect itinerary.
          </p>
        </div>

        {/* Floating cards deco */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
