import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AuthProvider from "@/components/providers/auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travenic | Your Personal AI Travel Planner",
  description: "Discover the world with Travenic. AI-powered itineraries, seamless bookings, and unforgettable journeys.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <QueryProvider>
          <TooltipProvider>
            <AuthProvider>
              <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
                {children}
              </GoogleOAuthProvider>
            </AuthProvider>
            <Toaster position="top-center" richColors />
            <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
