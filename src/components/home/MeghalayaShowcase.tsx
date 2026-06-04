'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, CloudRain, MapPin, Waves } from 'lucide-react';

const destinations = [
  {
    name: 'Shillong',
    tag: 'The Scotland of the East',
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a593?w=800&q=80',
    icon: MapPin,
    spots: 12,
  },
  {
    name: 'Sohra',
    tag: 'Chasing Waterfalls',
    image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80',
    icon: CloudRain,
    spots: 8,
  },
  {
    name: 'Dawki',
    tag: 'The Crystal Clear River',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    icon: Waves,
    spots: 5,
  },
];

export function MeghalayaShowcase() {
  return (
    <section className="py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary font-bold uppercase tracking-widest text-xs mb-4"
            >
              Curated Collections
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold font-heading text-foreground"
            >
              Explore <span className="text-primary-gradient">Meghalaya.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-sm mb-2"
          >
            Discover the most breathtaking spots in the land of clouds, curated for your next system-planned journey.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6 shadow-xl">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${dest.image}')` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                    <dest.icon className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{dest.tag}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white font-heading">{dest.name}</h3>
                </div>

                <div className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                  <ArrowUpRight className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="flex justify-between items-center px-2">
                <span className="text-sm font-bold text-foreground/80">{dest.spots} curated spots</span>
                <span className="text-xs font-semibold text-primary px-3 py-1 rounded-full bg-primary/10">High Demand</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
