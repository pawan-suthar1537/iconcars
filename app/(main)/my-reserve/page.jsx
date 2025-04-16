import { getUserTestDrives } from "@/actions/test-drive";
import React from "react";
import { ReservationsList } from "./_components/reservation-list";
import { auth } from "@clerk/nextjs/server";

export const metadata = {
  title: "My Reservations | ICON CARS",
  description: "Manage your test drive reservations",
};

const Myreservations = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect=/my-reserve");
  }

  const reservationsResult = await getUserTestDrives();

  return (
    <div className="container mx-auto px-4 py-8">
     
      <ReservationsList initialData={reservationsResult} />
    </div>
  );
};

export default Myreservations;
