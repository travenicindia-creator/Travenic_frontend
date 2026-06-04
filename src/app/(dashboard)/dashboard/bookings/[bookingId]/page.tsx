import React from "react";
import BookingDetailClient from "./BookingDetailClient";

export const metadata = {
  title: "Ticket Details | Travenic",
  description: "View your ticket and booking details.",
};

export default async function BookingDetailPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  return <BookingDetailClient bookingId={bookingId} />;
}
