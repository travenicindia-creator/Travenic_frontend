import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import { Section } from "@/components/ui/section";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <Section className="text-center">
        <div className="flex justify-center mb-8">
          <div className="h-32 w-32 bg-primary/10 rounded-[3rem] flex items-center justify-center rotate-12 drop-shadow-xl">
            <Compass className="h-16 w-16 text-primary" />
          </div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black font-heading tracking-tighter text-slate-900 mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-black mb-4 italic">Off the Beaten Path!</h2>
        
        <p className="text-slate-500 mb-8 max-w-md mx-auto font-medium">
          Looks like you've explored a little too far. The page you are looking for has been moved, deleted, or never existed.
        </p>

        <Link href="/dashboard">
          <Button className="rounded-2xl h-16 font-black px-10 text-lg shadow-[0_20px_50px_rgba(139,92,246,0.3)] bg-primary hover:scale-105 transition-transform">
            Return to Civilization
          </Button>
        </Link>
      </Section>
    </div>
  );
}
