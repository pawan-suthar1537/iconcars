import { getSavedCars } from "@/actions/cars-listing";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import { SavedCarsList } from "./_components/savedCarsList";

const SavedCars = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in/redirect=/saved-cars");
  }

  const result = await getSavedCars();
  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <SavedCarsList initialData={result} />
      </div>
    </div>
  );
};

export default SavedCars;
