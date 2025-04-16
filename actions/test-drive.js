"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { serializeCarData } from "@/lib/helper";

export async function bookTestDrive({
  carId,
  bookingDate,
  startTime,
  endTime,
  notes,
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("You must be logged in to book a test drive");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found in database");

    const car = await db.car.findUnique({
      where: { id: carId, status: "AVAILABLE" },
    });

    if (!car) throw new Error("Car not available for test drive");

    const existingBooking = await db.testDriveBooking.findFirst({
      where: {
        carId,
        bookingDate: new Date(bookingDate),
        startTime,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingBooking) {
      throw new Error(
        "This time slot is already booked. Please select another time."
      );
    }

    
    const booking = await db.testDriveBooking.create({
      data: {
        carId,
        userId: user.id,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        notes: notes || null,
        status: "PENDING",
      },
    });

    revalidatePath(`/test-drive/${carId}`);
    revalidatePath(`/cars/${carId}`);

    return {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.error("Error booking test drive:", error);
    return {
      success: false,
      error: error.message || "Failed to book test drive",
    };
  }
}

export async function getUserTestDrives() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const bookings = await db.testDriveBooking.findMany({
      where: { userId: user.id },
      include: {
        car: true,
      },
      orderBy: { bookingDate: "desc" },
    });

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      carId: booking.carId,
      car: serializeCarData(booking.car),
      bookingDate: booking.bookingDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: formattedBookings,
    };
  } catch (error) {
    console.error("Error fetching test drives:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function cancelTestDrive(bookingId) {
  try {
    console.log("cancelTestDrive called with bookingId:", bookingId);
    if (!bookingId || typeof bookingId !== "string") {
      console.error("Invalid bookingId:", bookingId);
      return {
        success: false,
        error: "Invalid booking ID",
      };
    }
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const booking = await db.testDriveBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    if (booking.userId !== user.id && user.role !== "ADMIN") {
      console.error(
        "Unauthorized attempt to cancel booking:",
        bookingId,
        "by user:",
        user.id
      );
      return {
        success: false,
        error: "Unauthorized to cancel this booking",
      };
    }

    if (booking.status === "CANCELLED") {
      console.warn("Booking already cancelled:", bookingId);
      return {
        success: false,
        error: "Booking is already cancelled",
      };
    }

    if (booking.status === "COMPLETED") {
      console.warn("Cannot cancel completed booking:", bookingId);
      return {
        success: false,
        error: "Cannot cancel a completed booking",
      };
    }

    const updatedBooking = await db.testDriveBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    console.log("Booking updated successfully:", updatedBooking);
    const serializedBooking = {
      ...updatedBooking,
      bookingDate: updatedBooking.bookingDate.toISOString(),
      createdAt: updatedBooking.createdAt.toISOString(),
      updatedAt: updatedBooking.updatedAt.toISOString(),
    };

    revalidatePath("/my-reserve");
    revalidatePath("/admin/test-drives");

    return {
      success: true,
      data: serializedBooking,
      message: "Test drive cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling test drive:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
