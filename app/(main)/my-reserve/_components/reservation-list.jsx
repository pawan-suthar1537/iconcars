"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

import { cancelTestDrive, getUserTestDrives } from "@/actions/test-drive";
import { TestDriveCard } from "@/components/test-drive-car";
import React, { useEffect, useState } from "react";
import useFetch from "@/hooks/use-fetch";

export function ReservationsList({ initialData }) {
  const [bookings, setBookings] = useState(initialData?.data || []);

  const {
    loading: cancelling,
    fn: cancelBookingFn,
    error: cancelError,
    data: cancelData,
  } = useFetch(cancelTestDrive);

  const {
    loading: fetching,
    fn: fetchBookings,
    data: fetchedBookings,
    error: fetchError,
  } = useFetch(getUserTestDrives);

  useEffect(() => {
    if (fetchedBookings?.success && fetchedBookings?.data) {
      console.log("Updating bookings:", fetchedBookings.data);
      setBookings(fetchedBookings.data);
    }
  }, [fetchedBookings]);

  useEffect(() => {
    if (cancelData) {
      console.log("Cancel data:", cancelData);
    }
    if (cancelError) {
      console.error("Cancel error:", cancelError);
    }
  }, [cancelData, cancelError]);

  const handleCancelBooking = async (bookingId) => {
    console.log("Attempting to cancel bookingId:", bookingId);
    try {
      const result = await cancelBookingFn(bookingId);
      console.log("Cancel result:", result);
      if (result && result.success) {
        toast.success("Test drive cancelled successfully");
        console.log("Triggering fetchBookings");
        await fetchBookings();
      } else {
        console.warn("Cancel failed with result:", result);
        toast.error(result?.error || "Failed to cancel test drive");
      }
    } catch (error) {
      console.error("Unexpected error in handleCancelBooking:", {
        message: error.message,
        stack: error.stack,
      });
      toast.error(
        error.message || "An unexpected error occurred while cancelling"
      );
    }
  };

  const upcomingBookings = bookings.filter((booking) =>
    ["PENDING", "CONFIRMED"].includes(booking.status)
  );

  const pastBookings = bookings.filter((booking) =>
    ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(booking.status)
  );

  if (fetchError || cancelError) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium mb-2">Error</h3>
        <p className="text-gray-500 mb-6">
          {fetchError || cancelError || "Failed to load reservations"}
        </p>
        <Button variant="default" onClick={() => fetchBookings()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-lg">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Calendar className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Reservations Found</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          You don't have any test drive reservations yet. Browse our cars and
          book a test drive to get started.
        </p>
        <Button variant="default" asChild>
          <Link href="/cars">Browse Cars</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-6xl mb-6 gradiant-title">Your Reservations</h1>
        <h2 className="text-2xl font-bold mb-4">Upcoming Test Drives</h2>
        {upcomingBookings.length === 0 ? (
          <p className="text-gray-500 italic">No upcoming test drives.</p>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <TestDriveCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelBooking}
                isCancelling={cancelling}
                showActions
                cancelError={cancelError}
                viewMode="list"
              />
            ))}
          </div>
        )}
      </div>

      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Past Test Drives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastBookings.map((booking) => (
              <TestDriveCard
                key={booking.id}
                booking={booking}
                showActions={false}
                isPast
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
