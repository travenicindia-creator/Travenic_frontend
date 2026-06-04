'use client';

import { motion } from 'framer-motion';
import { Brain, CalendarDays, Compass, MapPin, Sparkles, Ticket } from 'lucide-react';

const features = [
  {
    title: 'Smart Itinerary',
    description: 'AI-driven plans that adapt to your pace and interests automatically.',
    icon: Sparkles,
  },
  {
    title: 'Spot Intelligence',
    description: 'Deep insights on every travel spot, from best times to local tips.',
    icon: Brain,
  },
  {
    title: 'Day Guide',
    description: 'A dedicated view for your current day, keeping you on track.',
    icon: CalendarDays,
  },
  {
    title: 'Trip Timeline',
    description: 'Visual flow of your entire journey as a unified system.',
    icon: Compass,
  },
  {
    title: 'Activity Booking',
    description: 'Seamless integration with local providers for easy reservations.',
    icon: Ticket,
  },
  {
    title: 'Map Visualization',
    description: 'Interactive map layer showing your path across the landscape.',
    icon: MapPin,
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold font-heading mb-6"
          >
            Engineering the <span className="text-primary-gradient">Perfect Trip.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Our tools are designed to remove friction from the travel experience, allowing you to focus on the moments that matter.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2rem] border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/5 transition-all group"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-3 text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -z-10 h-[500px] w-[500px] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 -z-10 h-[500px] w-[500px] bg-accent/5 rounded-full blur-[100px]" />
    </section>
  );
}
