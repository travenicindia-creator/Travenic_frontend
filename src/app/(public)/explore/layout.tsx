import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Destinations | Travenic',
  description: 'Discover the world with Travenic. Explore breathtaking destinations, hidden gems, and curated experiences across the subcontinent.',
  openGraph: {
    title: 'Explore Destinations | Travenic',
    description: 'Discover the world with Travenic. Explore breathtaking destinations, hidden gems, and curated experiences across the subcontinent.',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a593?w=1200', 
        width: 1200,
        height: 630,
        alt: 'Travenic Destinations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Destinations | Travenic',
    description: 'Discover the world with Travenic. Explore breathtaking destinations, hidden gems, and curated experiences across the subcontinent.',
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
