"use client";

import { useState, useEffect } from "react";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Clock, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { exploreDestinations, explorePopularSpots, ExploreDestination, ExploreSpot } from "@/services/features.service";

export default function ExplorePage() {
  const [destinations, setDestinations] = useState<ExploreDestination[]>([]);
  const [spots, setSpots] = useState<ExploreSpot[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [destData, spotData] = await Promise.all([
          exploreDestinations({ search: search || undefined }),
          explorePopularSpots(8),
        ]);
        setDestinations(destData.destinations);
        setSpots(spotData.spots);
      } catch (err) {
        console.error("Failed to load explore data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setLoading(true);
  };

  return (
    <Section spacing="md" className="p-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
        <h1 className="text-5xl sm:text-6xl font-black font-heading tracking-tight mb-4">
          Explore <span className="text-primary italic">India</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Discover breathtaking destinations, hidden gems, and curated experiences across the subcontinent.
        </p>

        <div className="max-w-lg mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search destinations..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 h-14 rounded-2xl bg-muted/30 border-none text-lg focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Destinations Grid */}
          <div className="mb-16">
            <h2 className="text-2xl font-black font-heading mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Destinations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {destinations.map((dest, i) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/destinations/${dest.slug}`}>
                    <Card className="overflow-hidden border-none ring-1 ring-border/50 group cursor-pointer hover:ring-primary/40 transition-all hover:-translate-y-1">
                      <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
                        {dest.heroImage && (
                          <Image src={dest.heroImage} fill sizes="(max-width: 768px) 100vw, 300px" alt={dest.name} className="absolute inset-0 object-cover group-hover:scale-110 transition-transform duration-500" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-white font-black text-lg">{dest.name}</h3>
                          <p className="text-white/70 text-xs">{dest.state}</p>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-bold">{dest.spotCount} spots</Badge>
                          <Badge variant="outline" className="text-[10px] font-bold"><Clock className="h-3 w-3 mr-1" />{dest.avgDays}d avg</Badge>
                          <Badge variant="outline" className="text-[10px] font-bold capitalize">{dest.type}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
            {destinations.length === 0 && (
              <div className="text-center py-12 text-muted-foreground italic">No destinations found for &quot;{search}&quot;</div>
            )}
          </div>

          {/* Popular Spots */}
          {!search && spots.length > 0 && (
            <div>
              <h2 className="text-2xl font-black font-heading mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Popular Spots
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {spots.map((spot, i) => (
                  <motion.div
                    key={spot.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/spots/${spot.slug}`}>
                      <Card className="overflow-hidden border-none ring-1 ring-border/50 group cursor-pointer hover:ring-primary/40 transition-all">
                        <div className="h-32 bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                          {spot.imageUrl && (
                            <Image src={spot.imageUrl} fill sizes="(max-width: 768px) 100vw, 200px" alt={spot.name} className="absolute inset-0 object-cover group-hover:scale-110 transition-transform duration-500" />
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-bold text-sm truncate mb-1">{spot.name}</h3>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{spot.destination.name}</span>
                            {spot.entryFee > 0 && <span className="ml-auto text-emerald-600 font-bold">₹{spot.entryFee}</span>}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Section>
  );
}
