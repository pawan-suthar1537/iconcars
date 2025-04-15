import { getCarFilters } from "@/actions/cars-listing";
import React from "react";
import CarFilters from "./_components/car-filter";
import { CarListings } from "./_components/car-listing";

const CarsPage = async () => {
  const filterdata = await getCarFilters();
  return (
    <div className="mx-auto px-4 py-8">
      <h1 className="text-6xl mb-4 gradiant-title">Browse Cars</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Section */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <CarFilters filters={filterdata.data} />
        </div>

        {/* Car Listings */}
        <div className="flex-1">
          <CarListings />
        </div>
      </div>
    </div>
  );
};

export default CarsPage;
