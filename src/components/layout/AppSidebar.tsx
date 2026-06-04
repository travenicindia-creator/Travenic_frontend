'use client';

import * as React from 'react';
import {
  Calendar,
  Compass,
  LayoutDashboard,
  Map,
  PlusCircle,
  Settings,
  Sparkles,
  Ticket,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';

import { useAuthStore } from '@/store/use-auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/dashboard/UpgradeModal';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

const menuItems = [
  { title: 'My Trips', icon: Map, url: '/dashboard/trips' },
  { title: 'Active Trip', icon: Calendar, url: '/dashboard/trips/active' },
  { title: 'Create Trip', icon: PlusCircle, url: '/dashboard/create' },
  { title: 'Today', icon: LayoutDashboard, url: '/dashboard/today' },
  { title: 'Explore', icon: Compass, url: '/explore' },
  { title: 'Activities', icon: Sparkles, url: '/dashboard/activities' },
  { title: 'My Bookings', icon: Ticket, url: '/dashboard/bookings' },
  { title: 'Settings', icon: Settings, url: '/dashboard/settings' },
];


export function AppSidebar() {
  const { user, logout, checkAuth } = useAuthStore();
  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-background/50 backdrop-blur-sm">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/50">
        <div className="flex items-center gap-3 font-bold text-xl">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 group-data-[collapsible=icon]:p-0">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <span className="group-data-[collapsible=icon]:hidden tracking-tight text-foreground font-heading">
            Travenic
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 group-data-[collapsible=icon]:hidden">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    render={
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-[18px] w-[18px] text-muted-foreground group-hover/menu-button:text-primary transition-colors" />
                        <span className="group-data-[collapsible=icon]:hidden font-medium text-sm transition-colors text-foreground/80 group-hover/menu-button:text-foreground">
                          {item.title}
                        </span>
                      </Link>
                    }
                    className="h-10 px-3 hover:bg-accent/50 hover:text-accent-foreground group/menu-button"
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/50 group-data-[collapsible=icon]:p-2">
        <div 
          className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
          onClick={handleLogout}
          title="Click to logout"
        >
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="h-8 w-8 shrink-0 rounded-full border border-primary/20"
            />
          ) : (
            <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold border border-primary/20">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground truncate">{user?.name || 'Guest'}</span>
              <Badge 
                variant={user?.plan === 'PRO' ? 'default' : 'secondary'}
                className={cn(
                  "text-[8px] px-1 py-0 h-3 leading-none font-black tracking-widest",
                  user?.plan === 'PRO' ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-slate-100 text-slate-500"
                )}
              >
                {user?.plan || 'FREE'}
              </Badge>
            </div>
            <span className="text-[10px] text-muted-foreground truncate">{user?.email || 'Not logged in'}</span>
          </div>
        </div>
        
        {user?.plan === 'FREE' && (
          <div className="mt-4 group-data-[collapsible=icon]:hidden">
            <Button 
              size="sm" 
              className="w-full h-8 rounded-xl text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 border-none transition-all hover:scale-[1.02]"
              onClick={(e) => {
                e.stopPropagation();
                setShowUpgradeModal(true);
              }}
            >
              🚀 Upgrade to Pro
            </Button>
          </div>
        )}
      </SidebarFooter>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={checkAuth}
      />
    </Sidebar>
  );
}
