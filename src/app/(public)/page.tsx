'use client';

import { Hero } from '@/components/home/Hero';
import { ProblemSolution } from '@/components/home/ProblemSolution';
import { FeaturesGrid } from '@/components/home/FeaturesGrid';
import { MeghalayaShowcase } from '@/components/home/MeghalayaShowcase';
import { CTA } from '@/components/home/CTA';

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-background">
      <Hero />
      <ProblemSolution />
      <FeaturesGrid />
      <MeghalayaShowcase />
      <CTA />
    </div>
  );
}
