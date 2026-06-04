"use client";

import { useState, useEffect } from "react";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  CreditCard, 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  CheckCircle2,
  ChevronRight,
  LogOut,
  Camera,
  Mail,
  Smartphone,
  Globe,
  HardDrive,
  Sparkles,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import apiClient from "@/services/api/apiClient";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "next/navigation";

type Tab = "profile" | "subscription" | "plan" | "account";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const { logout } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/auth/me");
      setUserData(response.data.user);
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updates: any) => {
    setUpdating(true);
    try {
      const response = await apiClient.patch("/users/profile", updates);
      setUserData(response.data.user);
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "plan", label: "Membership", icon: CheckCircle2 },
    { id: "account", label: "Account Settings", icon: SettingsIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Preferences...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <Card className="p-12 text-center max-w-md bg-white border-none shadow-2xl rounded-[3rem]">
          <AlertCircle className="h-16 w-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 mb-4">Sync Failed</h2>
          <p className="text-slate-500 font-medium mb-8">{error}</p>
          <Button onClick={fetchProfile} className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-bold">Try Connection Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Section className="py-20 max-w-7xl mx-auto">
         {/* Header */}
         <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-4">
                 <div className="h-1.5 w-8 bg-slate-900 rounded-full" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Preferences</span>
              </div>
              <h1 className="text-5xl font-black font-heading tracking-tighter italic text-slate-900">
                System <span className="text-sky-500">Control.</span>
              </h1>
            </motion.div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Nav */}
            <div className="lg:col-span-3 space-y-2">
               {TABS.map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as Tab)}
                   className={cn(
                     "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm",
                     activeTab === tab.id 
                       ? "bg-white text-slate-900 shadow-xl shadow-slate-900/5 ring-1 ring-slate-100" 
                       : "text-slate-400 hover:bg-slate-100/50 hover:text-slate-600"
                   )}
                 >
                    <tab.icon className={cn("h-5 w-5", activeTab === tab.id ? "text-sky-500" : "text-slate-300")} />
                    {tab.label}
                 </button>
               ))}
               <div className="pt-8 mt-8 border-t border-slate-200">
                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm"
                  >
                     <LogOut className="h-5 w-5" />
                     Logout Account
                  </button>
               </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-9">
               <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                     {activeTab === "profile" && <ProfileSection user={userData} onUpdate={handleUpdateProfile} updating={updating} />}
                     {activeTab === "subscription" && <SubscriptionSection />}
                     {activeTab === "plan" && <PlanSection />}
                     {activeTab === "account" && <AccountSection />}
                  </motion.div>
               </AnimatePresence>
            </div>
         </div>
      </Section>
    </div>
  );
}

function ProfileSection({ user, onUpdate, updating }: { user: any, onUpdate: (u: any) => void, updating: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.name,
    phone: user.phone || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
       <Card className="border-none shadow-xl shadow-slate-900/5 rounded-[2.5rem] bg-white p-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10">
             <Button 
               variant="ghost" 
               onClick={() => setIsEditing(!isEditing)}
               className="rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400"
             >
                {isEditing ? "Cancel" : "Edit Info"}
             </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-10">
             <div className="relative group">
                <div className="h-32 w-32 rounded-[2.5rem] bg-slate-100 overflow-hidden ring-4 ring-white shadow-2xl">
                   <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="h-full w-full" alt="" />
                </div>
                <button className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                   <Camera className="h-4 w-4" />
                </button>
             </div>
             <div className="flex-1">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      placeholder="Full Name"
                    />
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      placeholder="Phone Number"
                    />
                    <Button type="submit" disabled={updating} className="h-10 px-6 rounded-xl bg-slate-900 text-white font-bold">
                       {updating ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                ) : (
                  <>
                    <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 mb-2">{user.name}</h2>
                    <p className="text-slate-500 font-medium mb-4 uppercase text-[10px] tracking-widest font-bold">{user.role} — Since {new Date(user.createdAt).getFullYear()}</p>
                    <div className="flex flex-wrap gap-2">
                       <Badge className="bg-slate-50 text-slate-500 hover:bg-slate-100 border-none px-3 py-1 font-bold">Nature Lover</Badge>
                       <Badge className="bg-slate-50 text-slate-500 hover:bg-slate-100 border-none px-3 py-1 font-bold">Backpacker</Badge>
                       <Badge className="bg-slate-50 text-slate-500 hover:bg-slate-100 border-none px-3 py-1 font-bold">Photography</Badge>
                    </div>
                  </>
                )}
             </div>
          </div>
       </Card>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-xl shadow-slate-900/5 rounded-[2.5rem] bg-white p-8">
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Contact Information</h3>
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Mail className="h-5 w-5" />
                   </div>
                   <div>
                      <span className="text-[10px] font-black uppercase text-slate-300">Email Address</span>
                      <p className="text-sm font-bold text-slate-900">{user.email}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Smartphone className="h-5 w-5" />
                   </div>
                   <div>
                      <span className="text-[10px] font-black uppercase text-slate-300">Phone Number</span>
                      <p className="text-sm font-bold text-slate-900">{user.phone || "Not set"}</p>
                   </div>
                </div>
             </div>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-900/5 rounded-[2.5rem] bg-white p-8">
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Regional Settings</h3>
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Globe className="h-5 w-5" />
                   </div>
                   <div>
                      <span className="text-[10px] font-black uppercase text-slate-300">Default Currency</span>
                      <p className="text-sm font-bold text-slate-900">INR (₹)</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <HardDrive className="h-5 w-5" />
                   </div>
                   <div>
                      <span className="text-[10px] font-black uppercase text-slate-300">Timezone</span>
                      <p className="text-sm font-bold text-slate-900">Asia/Kolkata (GMT+5:30)</p>
                   </div>
                </div>
             </div>
          </Card>
       </div>
    </div>
  );
}

function SubscriptionSection() {
  const router = useRouter();
  return (
    <div className="space-y-8">
       <Card className="border-none bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10">
             <Badge className="bg-sky-500 text-white border-none font-black px-4 py-1.5 rounded-lg">PRO PLAN</Badge>
          </div>
          <div className="relative z-10">
             <h3 className="text-3xl font-black italic tracking-tighter mb-2">Active Subscription</h3>
             <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-10">Next Renewal: Mar 24, 2026</p>
             
             <div className="flex flex-col sm:flex-row gap-8 items-end justify-between">
                <div>
                  <span className="text-5xl font-black tracking-tighter">₹499<span className="text-lg text-white/30 ml-2">/ month</span></span>
                </div>
                <div className="flex gap-4">
                   <Button onClick={() => router.push('/dashboard/checkout')} className="h-14 px-8 rounded-2xl bg-white text-slate-900 font-bold hover:bg-sky-500 hover:text-white transition-all">Manage Billing</Button>
                   <Button onClick={() => router.push('/dashboard/checkout')} variant="ghost" className="h-14 px-8 rounded-2xl border border-white/10 text-white/60 font-bold hover:bg-white/5">Cancel Plan</Button>
                </div>
             </div>
          </div>
       </Card>

       <Card className="border-none shadow-xl shadow-slate-900/5 rounded-[2.5rem] bg-white p-8">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Recent Invoices</h3>
          <div className="space-y-4">
             {[
               { id: "#TRV-9821", date: "Feb 24, 2026", amount: "₹499" },
               { id: "#TRV-9740", date: "Jan 24, 2026", amount: "₹499" }
             ].map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer group">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-sky-500 transition-colors">
                         <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-900">{inv.id}</p>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{inv.date}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <span className="text-sm font-black text-slate-900">{inv.amount}</span>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                   </div>
                </div>
             ))}
          </div>
       </Card>
    </div>
  );
}

function PlanSection() {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
       {/* Free */}
       <Card className="border-slate-200 rounded-[3rem] p-10 flex flex-col h-full bg-white relative">
          <div className="flex flex-col gap-1 mb-10">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Essential</span>
             <h3 className="text-3xl font-black italic tracking-tighter text-slate-900">Free Roam</h3>
          </div>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">Great for casual weekends and solo explorers starting their journey.</p>
          
          <div className="space-y-4 mb-12">
             {["Limited Itineraries", "Public Destinations", "Standard Booking"].map((feat) => (
               <div key={feat} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center">
                     <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  </div>
                  <span className="text-sm font-bold text-slate-600">{feat}</span>
               </div>
             ))}
          </div>

          <Button disabled className="w-full h-14 rounded-2xl mt-auto border border-slate-200 text-slate-300">Your Current Basic Plan</Button>
       </Card>

       {/* Pro */}
       <Card className="bg-sky-500 rounded-[3rem] p-10 flex flex-col h-full text-white shadow-2xl shadow-sky-500/20 relative">
          <div className="absolute top-8 right-8 h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
             <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1 mb-10">
             <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Top Tier</span>
             <h3 className="text-3xl font-black italic tracking-tighter">Pro Nomad</h3>
          </div>
          <p className="text-white/70 text-sm font-medium leading-relaxed mb-10">For the serious travelers who want AI-powered planning and premium rewards.</p>
          
          <div className="space-y-4 mb-12">
             {["Unlimited AI Itineraries", "Private Expeditions", "VIP Support", "Premium Discounts"].map((feat) => (
               <div key={feat} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-white">
                     <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <span className="text-sm font-black">{feat}</span>
               </div>
             ))}
          </div>

          <Button onClick={() => router.push('/dashboard/checkout')} className="w-full h-14 rounded-2xl mt-auto bg-white text-sky-500 font-bold hover:scale-105 transition-all shadow-xl shadow-sky-600/20">Upgrade Now</Button>
       </Card>
    </div>
  );
}

function AccountSection() {
  return (
    <div className="space-y-8">
       <Card className="border-none shadow-xl shadow-slate-900/5 rounded-[2.5rem] bg-white p-10">
          <div className="flex items-center gap-4 mb-10">
             <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                <Shield className="h-6 w-6" />
             </div>
             <div>
                <h3 className="text-xl font-black italic tracking-tight text-slate-900">Security & Privacy</h3>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Enhanced Protection</p>
             </div>
          </div>
          
          <div className="space-y-6">
             <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                   <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                   <p className="text-[10px] font-bold text-slate-400">Keep your account secure with 2FA.</p>
                </div>
                <div className="h-6 w-11 rounded-full bg-slate-200 relative cursor-pointer group">
                   <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all group-hover:translate-x-1" />
                </div>
             </div>
             <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                   <p className="text-sm font-bold text-slate-900">Change Password</p>
                   <p className="text-[10px] font-bold text-slate-400">Last changed 3 months ago.</p>
                </div>
                <Button variant="ghost" className="text-indigo-500 font-bold text-xs uppercase tracking-widest">Update</Button>
             </div>
          </div>
       </Card>

       <Card className="border-none shadow-xl shadow-slate-900/5 rounded-[2.5rem] bg-white p-10">
          <div className="flex items-center gap-4 mb-10">
             <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                <Bell className="h-6 w-6" />
             </div>
             <div>
                <h3 className="text-xl font-black italic tracking-tight text-slate-900">Notifications</h3>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Stay Updated</p>
             </div>
          </div>

          <div className="space-y-6">
             {["Email Alerts", "Push Notifications", "Monthly Travel Wrapped"].map((notif) => (
                <div key={notif} className="flex items-center justify-between pb-6 border-b border-slate-50 last:pb-0 last:border-0">
                   <span className="text-sm font-bold text-slate-600">{notif}</span>
                   <div className="h-6 w-11 rounded-full bg-sky-500 relative cursor-pointer">
                      <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                   </div>
                </div>
             ))}
          </div>
       </Card>
    </div>
  );
}
