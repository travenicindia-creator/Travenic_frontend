import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { token } = await params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/shared/trip/${token}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) throw new Error('Trip not found');
    
    const data = await res.json();
    const trip = data.trip;

    return {
      title: `${trip.title} | Shared Trip`,
      description: `View this amazing ${trip.travelerCount}-person trip to ${trip.destination.name} planned with Travenic!`,
      openGraph: {
        title: `${trip.title} | Shared Trip`,
        description: `View this amazing ${trip.travelerCount}-person trip to ${trip.destination.name} planned with Travenic!`,
        images: trip.destination?.heroImage ? [trip.destination.heroImage] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Shared Trip | Travenic',
      description: 'View a shared trip on Travenic.',
    };
  }
}

export default function SharedTripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
