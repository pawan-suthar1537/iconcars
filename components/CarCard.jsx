"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import { Button } from "./ui/button";
import { Heart, Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toggleSavedCar } from "@/actions/cars-listing";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

const CarCard = ({ car }) => {
  const [saved, setsaved] = useState(car.wishlisted);
  const { isSignedIn } = useAuth();

  const router = useRouter();

  const {
    loading: toggleSavedCarloading,
    fn: toggleSavedCarfn,
    data: toggleSavedCardata,
    error: toggleSavedCarerror,
  } = useFetch(toggleSavedCar);

  const handlesaved = async (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error("please sign to save cars");
      router.push("/sign-in");
      return;
    }
    if (toggleSavedCarloading) return;
    await toggleSavedCarfn(car.id);
  };

  useEffect(() => {
    if (toggleSavedCardata?.success && toggleSavedCardata.saved !== saved) {
      setsaved(toggleSavedCardata.saved);
      toast.success(toggleSavedCardata.message);
    }
  }, [toggleSavedCardata, setsaved]);
  useEffect(() => {
    if (toggleSavedCarerror) {
      toast.error("Failed to update favorites");
    }
  }, [toggleSavedCarerror]);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition group py-0">
      <div className="relative h-48">
        {car.images && car.images.length > 0 ? (
          <div className="relative w-full h-full">
            <Image
              src={car.images[0]}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div></div>
        )}
        {/* favorite button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handlesaved}
          className={`absolute top-2 right-2 bg-white/90  rounded-full cursor-pointer p-1.5 ${
            saved
              ? "text-red-500 hover:text-red-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {toggleSavedCarloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={saved ? "fill-current" : ""} size={20} />
          )}
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="flex flex-col mb-2">
          <h3 className="text-lg font-bold line-clamp-1">
            {car.make} {car.model}
          </h3>
          <span className="text-xl font-bold text-blue-600">
            {car.price.toLocaleString()}
          </span>
        </div>
        <div className="text-gray-600 mb-2 flex items-center">
          <span>{car.year}</span>
          <span className="mx-2">.</span>
          <span>{car.transmission}</span>
          <span className="mx-2">.</span>
          <span>{car.fuelType}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          <Badge variant="outline" className="bg-gray-50">
            {car.bodyType}
          </Badge>
          <Badge variant="outline" className="bg-gray-50">
            {car.mileage.toLocaleString()} miles
          </Badge>
          <Badge variant="outline" className="bg-gray-50">
            {car.color}
          </Badge>
        </div>

        <div className="flex justify-between">
          <Button
            className="flex-1 cursor-pointer"
            onClick={() => router.push(`/cars/${car.id}`)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarCard;
