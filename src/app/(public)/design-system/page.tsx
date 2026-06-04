'use client';

import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function DesignSystemPage() {
  return (
    <Section spacing="lg">
      <div className="mb-16">
        <h1 className="text-4xl font-extrabold mb-4 sm:text-5xl">Design System</h1>
        <p className="text-xl text-muted-foreground">The visual foundation of the Travenic travel platform.</p>
      </div>

      <div className="grid gap-16">
        {/* Colors Section */}
        <div>
          <h2 className="text-2xl font-bold mb-8 border-b pb-2">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorBlock color="bg-primary" name="Primary" hex="Trust Blue" />
            <ColorBlock color="bg-accent" name="Accent" hex="Sky Blue" />
            <ColorBlock color="bg-primary-gradient" name="Primary Gradient" hex="Blue to Sky" />
            <ColorBlock color="bg-background" name="Background" hex="Soft Gray" border />
          </div>
        </div>

        {/* Typography Section */}
        <div>
          <h2 className="text-2xl font-bold mb-8 border-b pb-2">Typography</h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-mono text-muted-foreground mb-2">Heading 1 / Outfit Bold</p>
              <h1 className="text-5xl">Adventure Awaits</h1>
            </div>
            <div>
              <p className="text-sm font-mono text-muted-foreground mb-2">Heading 2 / Outfit Bold</p>
              <h2 className="text-3xl">Explore the Unseen</h2>
            </div>
            <div>
              <p className="text-sm font-mono text-muted-foreground mb-2">Body Text / Inter Regular</p>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                Travenic uses AI to curate journeys that don't just fill your schedule, they fill your soul. 
                Discover hidden gems and optimize every moment of your exploration with our smart routing.
              </p>
            </div>
          </div>
        </div>

        {/* Components Section */}
        <div>
          <h2 className="text-2xl font-bold mb-8 border-b pb-2">Core Components</h2>
          <div className="grid gap-12 md:grid-cols-2">
            {/* Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Primary Action</Button>
                <Button variant="outline">Secondary</Button>
                <Button variant="ghost">Ghost Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="lg">Large Button</Button>
                <Button size="sm">Small</Button>
              </div>
            </div>

            {/* Inputs & Badges */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold mb-4">Inputs</h3>
                <Input placeholder="Enter destination..." className="max-w-xs" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>AI Suggested</Badge>
                  <Badge variant="outline">Verified</Badge>
                  <Badge variant="secondary">Popular</Badge>
                  <Badge variant="destructive">Sold Out</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div>
          <h2 className="text-2xl font-bold mb-8 border-b pb-2">Cards</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="overflow-hidden border-none shadow-xl shadow-primary/5">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <span className="text-muted-foreground italic">Card Image</span>
              </div>
              <CardHeader>
                <CardTitle>Shillong Explorer</CardTitle>
                <CardDescription>4 Days • ₹12,000</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">The Scotland of the East awaits your arrival with breathtaking waterfalls.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Itinerary</Button>
              </CardFooter>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle>AI Planner Premium</CardTitle>
                <CardDescription className="text-primary-foreground/70">Unlock full potential.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>• Unlimited Itineraries</li>
                  <li>• Priority AI Processing</li>
                  <li>• Exclusive Deals</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full">Upgrade Now</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Section>
  );
}

function ColorBlock({ color, name, hex, border = false }: { color: string, name: string, hex: string, border?: boolean }) {
  return (
    <div className="space-y-2">
      <div className={`h-24 rounded-2xl ${color} ${border ? 'border' : ''} shadow-inner`} />
      <div>
        <p className="font-bold text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">{hex}</p>
      </div>
    </div>
  );
}
