import Link from 'next/link';
import { Compass, Github, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight text-primary font-heading">
                Travenic
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Making travel planning effortless with the power of artificial intelligence. Your journey, our intelligence.
            </p>
            <div className="flex gap-4">
              <Twitter className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-primary" />
              <Instagram className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-primary" />
              <Github className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-primary" />
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/plan" className="hover:text-primary transition-colors">AI Planner</Link></li>
              <li><Link href="/destinations" className="hover:text-primary transition-colors">Destinations</Link></li>
              <li><Link href="/trips" className="hover:text-primary transition-colors">My Journeys</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Travenic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
