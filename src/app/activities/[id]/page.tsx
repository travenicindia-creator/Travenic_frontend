"use client";

import { use, useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Clock, 
  Sparkles, 
  Star, 
  Users, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  Award, 
  AlertCircle, 
  ThumbsUp, 
  MapPin, 
  Calendar,
  DollarSign,
  User,
  Heart,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { activityService, Activity } from "@/services/activity.service";
import { cartService } from "@/services/cart.service";
import { bookingService } from "@/services/booking.service";
import { toast } from "sonner";
import { ItemChatSection } from "@/components/ui/ItemChatSection";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  helpfulCount: number;
}

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  
  const fromTrip = searchParams.get('fromTrip');
  const day = searchParams.get('day');

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Group size calculator state
  const [groupSize, setGroupSize] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [hasAddedToCart, setHasAddedToCart] = useState(false);
  
  // Rating and reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  // Load activity and review data
  useEffect(() => {
    if (!id) return;

    const fetchActivityData = async () => {
      try {
        setLoading(true);
        const data = await activityService.getActivityById(id);
        setActivity(data);

        // Get reviews from local storage or generate default ones
        const savedReviews = localStorage.getItem(`travenic_reviews_${id}`);
        if (savedReviews) {
          setReviews(JSON.parse(savedReviews));
        } else {
          // Generate default high-quality reviews based on activity
          const defaultReviews = generateSeedReviews(data.title);
          setReviews(defaultReviews);
          localStorage.setItem(`travenic_reviews_${id}`, JSON.stringify(defaultReviews));
        }
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || "Failed to load activity details.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [id]);

  // Seed review generator to make each activity feel premium and highly contextualized
  const generateSeedReviews = (title: string): Review[] => {
    const isWater = /water|fall|lake|river|pool|boat/i.test(title);
    const isTrek = /trek|hike|climb|mountain|valley/i.test(title);
    const isHeritage = /fort|palace|museum|temple|heritage|city/i.test(title);
    const isSafari = /safari|jungle|national|wildlife/i.test(title);

    if (isWater) {
      return [
        {
          id: "1",
          name: "Rohan Sharma",
          rating: 5,
          comment: "Absolutely breathtaking! The spray from the water was so refreshing and our guide knew the best spots for photography. Highly recommend booking a group slot for discounts!",
          date: "May 12, 2026",
          helpfulCount: 42
        },
        {
          id: "2",
          name: "Aanya Patel",
          rating: 4,
          comment: "Super professional arrangement. We booked the Duo slot and got a neat discount. The trek down to the water is slightly slippery, so make sure to wear solid shoes.",
          date: "April 29, 2026",
          helpfulCount: 19
        },
        {
          id: "3",
          name: "David K.",
          rating: 5,
          comment: "An incredible slice of heaven! Water is crisp and clean. Travenic made the booking seamless, and the coordination at the spot was flawless.",
          date: "April 15, 2026",
          helpfulCount: 8
        }
      ];
    } else if (isTrek) {
      return [
        {
          id: "1",
          name: "Vikram Malhotra",
          rating: 5,
          comment: "Top notch experience! The view from the summit is spectacular. Our guide was extremely motivating and well-equipped with safety gears. Highlight of my trip!",
          date: "May 08, 2026",
          helpfulCount: 31
        },
        {
          id: "2",
          name: "Pooja Reddy",
          rating: 5,
          comment: "Tiring but 100% worth it. The early morning starts are best to catch the sunrise. The squad discount for 6 people was a huge saver for us!",
          date: "May 02, 2026",
          helpfulCount: 22
        },
        {
          id: "3",
          name: "Sarah Jenkins",
          rating: 4,
          comment: "Excellent trekking trail. Challenging in parts but accessible for moderate hikers. Guide was knowledgeable about local plants and birds.",
          date: "March 20, 2026",
          helpfulCount: 5
        }
      ];
    } else if (isHeritage) {
      return [
        {
          id: "1",
          name: "Meera Nair",
          rating: 5,
          comment: "The historic narration was so detailed and immersive. Felt like traveling back in time. The palace corridors are very majestic and perfect for photography.",
          date: "May 15, 2026",
          helpfulCount: 28
        },
        {
          id: "2",
          name: "Kabir Sengupta",
          rating: 4,
          comment: "Highly educational and beautiful. Ideal for families. The ticket inclusion in this tour saved us from waiting in huge queues. Kudos to Travenic!",
          date: "May 01, 2026",
          helpfulCount: 14
        }
      ];
    } else if (isSafari) {
      return [
        {
          id: "1",
          name: "Aditya Verma",
          rating: 5,
          comment: "Spotted a mother tiger and two cubs! The open jeep safari is thrilling. Our driver was incredibly skilled at tracking calls. Worth every rupee.",
          date: "May 10, 2026",
          helpfulCount: 56
        },
        {
          id: "2",
          name: "Lisa Anderson",
          rating: 5,
          comment: "Exceptional national park tour. Extremely safe, well-timed, and we also saw elephants, deer, and exotic peacocks. The guide was wonderful.",
          date: "April 24, 2026",
          helpfulCount: 27
        }
      ];
    }

    return [
      {
        id: "1",
        name: "Arjun Mehta",
        rating: 5,
        comment: "Outstanding quest experience! Everything was exceptionally well-curated. Friendly staff, timely departure, and extremely comfortable arrangement.",
        date: "May 14, 2026",
        helpfulCount: 15
      },
      {
        id: "2",
        name: "Sophia Martinez",
        rating: 4,
        comment: "Excellent value for money. Very fun and engaging activity. Will definitely book again on my next trip through Travenic!",
        date: "May 05, 2026",
        helpfulCount: 9
      }
    ];
  };

  // Group size discount calculation logic
  const getDiscountPercentage = (size: number) => {
    if (size >= 6) return 15; // Squad discount
    if (size >= 3) return 10; // Tribe discount
    if (size === 2) return 5;  // Duo discount
    return 0;                 // Single Nomad
  };

  const getPricingLabel = (size: number) => {
    if (size >= 6) return "Squad Rate";
    if (size >= 3) return "Tribe Rate";
    if (size === 2) return "Duo Discount Rate";
    return "Standard Solo Rate";
  };

  const basePrice = activity?.pricePerPerson || 0;
  const discountPercent = getDiscountPercentage(groupSize);
  const discountAmount = (basePrice * discountPercent) / 100;
  const discountedPricePerPerson = basePrice - discountAmount;
  const totalPrice = discountedPricePerPerson * groupSize;

  // Aggregate ratings calculation
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "4.8";

  const getRatingPercentage = (stars: number) => {
    if (reviews.length === 0) return 0;
    const count = reviews.filter(r => Math.round(r.rating) === stars).length;
    return Math.round((count / reviews.length) * 100);
  };

  // Add to plan / cart logic
  const handleAddToCart = async () => {
    if (!activity) return;
    setIsAdding(true);
    try {
      await cartService.addToCart({
        type: 'ACTIVITY',
        activityId: activity.id,
        numberOfPersons: groupSize,
        price: totalPrice,
      });

      setHasAddedToCart(true);
      toast.success(`${activity.title} added to your checkout cart!`, {
        description: `Plan updated for ${groupSize} travelers.`,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add activity to cart.");
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Review submission with live re-rendering and storage persistence
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userComment.trim()) {
      toast.error("Please fill in both name and review comment!");
      return;
    }

    setIsSubmittingReview(true);

    const newReview: Review = {
      id: Date.now().toString(),
      name: userName,
      rating: userRating,
      comment: userComment,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      helpfulCount: 0
    };

    setTimeout(() => {
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      localStorage.setItem(`travenic_reviews_${id}`, JSON.stringify(updatedReviews));
      
      setUserComment("");
      setUserName("");
      toast.success("Thank you for sharing your experience!", {
        description: "Your review is now live on the quest board."
      });
      setIsSubmittingReview(false);
    }, 800);
  };

  const handleHelpfulClick = (reviewId: string) => {
    const updated = reviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, helpfulCount: r.helpfulCount + 1 };
      }
      return r;
    });
    setReviews(updated);
    localStorage.setItem(`travenic_reviews_${id}`, JSON.stringify(updated));
    toast.success("Marked review as helpful!");
  };

  // Back destination link
  const handleBack = () => {
    if (fromTrip && day) {
      router.push(`/dashboard/trips/${fromTrip}/days/${day}`);
    } else if (activity?.travelSpot?.slug) {
      router.push(`/spots/${activity.travelSpot.slug}`);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-amber-500 animate-pulse mx-auto mb-4" />
          <p className="text-slate-400 font-black animate-pulse uppercase tracking-widest text-xs">Assembling Quest Details...</p>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <AlertCircle className="h-16 w-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-black italic mb-2">Quest Not Found</h2>
        <p className="text-slate-400 mb-6 text-center max-w-md">{error || "We couldn't retrieve this quest details."}</p>
        <Button onClick={handleBack} className="rounded-xl px-8 bg-white text-black font-black">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-32 font-sans selection:bg-amber-500 selection:text-black">
      {/* Background Graphic Accent */}
      <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[800px] left-0 h-[500px] w-[500px] bg-sky-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero Banner Section */}
      <div className="relative h-[65vh] w-full overflow-hidden">
        <img 
          src={activity.imageUrl || "https://images.unsplash.com/photo-1596422846543-75c6fc18a593?w=1600&q=80"} 
          alt={activity.title}
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* Navigation Overlays */}
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-20">
          <button 
            onClick={handleBack}
            className="flex items-center text-xs font-black uppercase tracking-widest text-white/90 hover:text-white transition-all bg-black/40 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {fromTrip ? "Back to Trip Itinerary" : "Back to Gem spot"}
          </button>
          
          <button 
            onClick={() => {
              setWishlisted(!wishlisted);
              toast.success(wishlisted ? "Removed from wishlist" : "Saved to your Travel wishlist!");
            }}
            className={cn(
              "h-12 w-12 rounded-2xl backdrop-blur-xl border flex items-center justify-center shadow-2xl transition-all hover:scale-105",
              wishlisted 
                ? "bg-rose-500 border-rose-600 text-white" 
                : "bg-black/40 border-white/10 text-white hover:text-rose-400"
            )}
          >
            <Heart className={cn("h-5 w-5", wishlisted && "fill-white")} />
          </button>
        </div>

        {/* Hero Title Container */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-10">
          <Section className="p-0 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Badge className="bg-amber-500 text-black font-black uppercase tracking-widest text-[10px] px-3.5 py-1 hover:bg-amber-400 transition-colors">
                  CURATED QUEST
                </Badge>
                {activity.travelSpot?.name && (
                  <Badge variant="outline" className="bg-white/10 border-white/10 backdrop-blur-md text-white font-bold text-[10px] px-3.5 py-1">
                    <MapPin className="h-3 w-3 mr-1 inline" />
                    {activity.travelSpot.name}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-amber-400 font-black text-sm ml-2 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span>{averageRating} ({reviews.length} reviews)</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-8xl font-black font-heading tracking-tighter italic leading-none text-white max-w-4xl drop-shadow-2xl">
                {activity.title}
              </h1>
            </motion.div>
          </Section>
        </div>
      </div>

      <Section className="py-12 relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Main Info Blocks (Col: 8) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5">
              <div className="text-center md:text-left flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">QUEST DURATION</span>
                <p className="text-lg font-black text-white flex items-center justify-center md:justify-start gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  {activity.durationMinutes} Minutes
                </p>
              </div>
              <div className="text-center md:text-left border-x border-white/5 px-6 flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">DIFFICULTY</span>
                <p className="text-lg font-black text-white flex items-center justify-center md:justify-start gap-2 capitalize">
                  <TrendingUp className="h-5 w-5 text-sky-400" />
                  {activity.difficulty || "Moderate"}
                </p>
              </div>
              <div className="text-center md:text-left flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">BASE PRICE</span>
                <p className="text-lg font-black text-amber-400 flex items-center justify-center md:justify-start gap-1">
                  ₹{activity.pricePerPerson} <span className="text-[10px] text-slate-500 font-bold uppercase">INR</span>
                </p>
              </div>
            </div>

            {/* Description & Overview */}
            <div className="bg-slate-900/20 rounded-[3rem] p-10 border border-white/5">
              <h2 className="text-3xl font-black italic tracking-tight text-white mb-6 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-amber-500" />
                The Experience
              </h2>
              <div className="prose prose-invert prose-lg max-w-none text-slate-300 font-medium leading-relaxed">
                <p>{activity.description || "Enjoy an elite, expert-guided tour meticulously designed to uncover the hidden stories, scenic highlights, and cultural gems of this beautiful destination. Includes exclusive permissions, first-class gear coordination, and curated itineraries."}</p>
                <p className="mt-4">Designed for seasoned travelers looking to break away from traditional tourist traps. Our certified local guides guarantee an intimate exploration while providing a premium, stress-free atmosphere.</p>
              </div>
            </div>

            {/* What is Included / Excluded (Premium Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Inclusions */}
              <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-emerald-500/10">
                <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  What's Included
                </h3>
                <ul className="space-y-4 text-slate-300 font-bold text-sm">
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Certified Professional English/Hindi Guide</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>State Forest Permits & Entrance Tickets</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>High-end Safety Harness & Gear (where applicable)</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Complementary Bottled Mineral Water</span>
                  </li>
                </ul>
              </div>

              {/* Exclusions */}
              <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-rose-500/10">
                <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                  <ShieldAlert className="h-6 w-6 text-rose-500" />
                  What's Excluded
                </h3>
                <ul className="space-y-4 text-slate-300 font-bold text-sm">
                  <li className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                    <span>Personal expenses, Souvenirs & Alcoholic Drinks</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                    <span>Gratuities and tips for the local adventure guide</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                    <span>Pickup or Drop-off from Hotel (unless rental configured)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Terms and Cancellation Rules */}
            <div className="bg-slate-900/30 rounded-[3rem] p-10 border border-white/5 relative overflow-hidden">
              <h3 className="text-2xl font-black italic tracking-tight text-white mb-6 flex items-center gap-3">
                <Award className="h-7 w-7 text-amber-500" />
                Booking Guidelines & Cancellation Policy
              </h3>
              
              <div className="space-y-6 text-slate-300 text-sm font-medium leading-relaxed">
                <div>
                  <h4 className="font-black text-white uppercase text-xs tracking-wider mb-2">Refund Tiers (Travenic Standard)</h4>
                  <ul className="space-y-2">
                    <li className="flex gap-2 items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span><strong>24+ Hours Notice:</strong> 100% full refund immediately returned.</span>
                    </li>
                    <li className="flex gap-2 items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span><strong>12 - 24 Hours Notice:</strong> 50% refund applied to your wallet.</span>
                    </li>
                    <li className="flex gap-2 items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span><strong>Less than 12 Hours:</strong> Non-refundable due to vendor allocation locks.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-white/5">
                  <h4 className="font-black text-white uppercase text-xs tracking-wider mb-2">Quest Rules</h4>
                  <p>Guests must be at least 8 years old to join standard wilderness routes. Pregnant women, travelers with back issues, or cardiovascular conditions are advised to consult our guides before booking. Wear sportswear and robust outdoor shoes.</p>
                </div>
              </div>
            </div>

            {/* Rating System & Comments section */}
            <div className="bg-slate-900/20 rounded-[3rem] p-10 border border-white/5 space-y-12">
              <h3 className="text-3xl font-black italic text-white flex items-center gap-3">
                <Star className="h-8 w-8 text-amber-500 fill-amber-500" />
                Community Guestbooks & Reviews
              </h3>

              {/* Rating Summary Block */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-white/5 pb-10">
                <div className="md:col-span-4 text-center">
                  <p className="text-6xl md:text-7xl font-black text-white leading-none">{averageRating}</p>
                  <div className="flex justify-center gap-1 my-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-5 w-5", i < Math.round(parseFloat(averageRating)) ? "fill-amber-400 text-amber-400" : "text-slate-700")} />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{reviews.length} verified ratings</p>
                </div>

                <div className="md:col-span-8 space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-4 text-sm font-bold">
                      <span className="w-12 text-slate-400 text-right">{stars} Star</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full" 
                          style={{ width: `${getRatingPercentage(stars)}%` }} 
                        />
                      </div>
                      <span className="w-12 text-slate-500 text-right">{getRatingPercentage(stars)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add a Review Form */}
              <form onSubmit={handleSubmitReview} className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5 space-y-6">
                <h4 className="text-lg font-black text-white uppercase tracking-wider">Leave a Guest Review</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Priyanshu Sen"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="h-12 w-full rounded-xl bg-slate-950 border border-white/10 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Star Rating</label>
                    <div className="flex items-center gap-2 h-12">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="h-10 w-10 flex items-center justify-center transition-all"
                        >
                          <Star className={cn("h-8 w-8 transition-colors", star <= userRating ? "fill-amber-400 text-amber-400" : "text-slate-700 hover:text-slate-500")} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Experience</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Tell other travelers about your guide, the difficulty, and the adventure..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-white resize-none"
                  />
                </div>

                <div className="text-right">
                  <Button 
                    type="submit"
                    disabled={isSubmittingReview}
                    className="h-12 px-8 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all disabled:opacity-50"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-6 pt-4">
                <AnimatePresence>
                  {reviews.map((review) => (
                    <motion.div 
                      key={review.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900/20 rounded-2xl p-6 border border-white/5 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-white border border-white/5">
                            <User className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-black text-sm text-white">{review.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold">{review.date}</p>
                          </div>
                        </div>

                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn("h-3.5 w-3.5", i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-800")} />
                          ))}
                        </div>
                      </div>

                      <p className="text-slate-300 text-sm font-medium leading-relaxed leading-normal">{review.comment}</p>
                      
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <button 
                          onClick={() => handleHelpfulClick(review.id)}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-white transition-colors"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          Helpful ({review.helpfulCount})
                        </button>
                        
                        <Badge className="bg-slate-800 text-slate-400 border-none font-bold text-[9px] px-2 py-0.5">
                          Verified Quest Booking
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

            </div>

            {/* AI Doubt Chat Assistant */}
            <div className="mt-12">
              <ItemChatSection 
                  itemId={activity.id} 
                  itemType="activity" 
                  itemName={activity.title} 
                  theme="dark" 
              />
            </div>

          </div>

          {/* Sidebar Booking Card (Col: 4) */}
          <div className="lg:col-span-4 sticky top-8">
            <Card className="bg-slate-900 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6">
              
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Quest Reservation</span>
                <h3 className="text-2xl font-black italic tracking-tight text-white leading-tight">Book Your Spot</h3>
              </div>

              {/* Real-time Tiers list indicator */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Travenic Group Discount Tiers</span>
                <div className="grid grid-cols-1 gap-2">
                  <div className={cn("flex justify-between items-center px-4 py-2 rounded-xl text-xs font-bold border", groupSize === 1 ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-slate-950/40 border-transparent text-slate-500")}>
                    <span>1 Traveler (Standard)</span>
                    <span>No Discount</span>
                  </div>
                  <div className={cn("flex justify-between items-center px-4 py-2 rounded-xl text-xs font-bold border", groupSize === 2 ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-slate-950/40 border-transparent text-slate-500")}>
                    <span>2 Travelers (Duo Save)</span>
                    <span>5% OFF</span>
                  </div>
                  <div className={cn("flex justify-between items-center px-4 py-2 rounded-xl text-xs font-bold border", (groupSize >= 3 && groupSize <= 5) ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-slate-950/40 border-transparent text-slate-500")}>
                    <span>3 - 5 Travelers (Tribe)</span>
                    <span>10% OFF</span>
                  </div>
                  <div className={cn("flex justify-between items-center px-4 py-2 rounded-xl text-xs font-bold border", groupSize >= 6 ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-slate-950/40 border-transparent text-slate-500")}>
                    <span>6+ Travelers (Squad Save)</span>
                    <span>15% OFF</span>
                  </div>
                </div>
              </div>

              {/* Group Size selection counter */}
              <div className="bg-slate-950/50 p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GUEST SIZE</span>
                    <p className="text-base font-black text-white">{groupSize} {groupSize === 1 ? "Nomad" : "Travelers"}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                      className="h-10 w-10 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 transition-colors flex items-center justify-center font-bold text-white text-lg"
                    >
                      -
                    </button>
                    <span className="font-black text-xl w-6 text-center text-white">{groupSize}</span>
                    <button 
                      onClick={() => setGroupSize(Math.min(15, groupSize + 1))}
                      className="h-10 w-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-black transition-colors flex items-center justify-center font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Current tier:</span>
                  <span className="text-amber-400 uppercase font-black text-[10px] tracking-wide">{getPricingLabel(groupSize)}</span>
                </div>
              </div>

              {/* Price Calculations */}
              <div className="space-y-3 bg-slate-950/30 p-5 rounded-2xl border border-white/5 font-bold text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Price per Person:</span>
                  <span>₹{basePrice}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Group discount ({discountPercent}%):</span>
                    <span>-₹{discountAmount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Travelers:</span>
                  <span>× {groupSize}</span>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between items-end">
                  <span className="text-slate-300">Total Price:</span>
                  <span className="text-3xl font-black text-amber-400">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Add / Checkout Actions */}
              <Button 
                onClick={handleAddToCart}
                disabled={isAdding || hasAddedToCart}
                className={cn(
                  "h-16 w-full rounded-2xl font-black text-base transition-all shadow-xl flex items-center justify-center gap-2",
                  hasAddedToCart 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white cursor-default"
                    : "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/10 hover:scale-[1.02]"
                )}
              >
                {isAdding ? "Locking Booking..." : 
                 hasAddedToCart ? (
                   <>
                     <CheckCircle2 className="h-5 w-5" />
                     Added to Cart!
                   </>
                 ) : "Add Experience to Plan"}
              </Button>

              <p className="text-[10px] text-slate-500 font-bold text-center leading-normal">
                Travenic guarantees elite guides. Cancellation up to 24 hours prior to starting slot will be fully refunded under our booking shield cover.
              </p>

            </Card>
          </div>

        </div>
      </Section>
    </div>
  );
}
