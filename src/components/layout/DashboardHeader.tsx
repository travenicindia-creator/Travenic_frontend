'use client';

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useAuthStore } from "@/store/use-auth-store";
import { Button } from "@/components/ui/button";
import { LogOut, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { CartDrawer } from "@/components/ui/CartDrawer";

export function DashboardHeader({ title }: { title: string }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 px-6 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 sticky top-0 bg-background/60 backdrop-blur-xl z-10">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1 h-8 w-8 hover:bg-accent/50" />
        <Separator orientation="vertical" className="mr-1 h-4 bg-border/50" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block text-muted-foreground/30" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs font-semibold text-foreground">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
            Hello, <span className="text-foreground font-bold">{user.name}</span>
          </span>
        )}
        <CartDrawer />
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl font-bold gap-2 transition-all"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
