"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const CarsList = () => {
  const router = useRouter();
  const [search, setsearch] = useState("");
  const handlesearchsubmit = (e) => {
    e.preventDefault();
    // const searchValue = e.target[0].value;
    // if (searchValue) {
    //   router.push(`/admin/cars?search=${searchValue}`);
    // } else {
    //   router.push("/admin/cars");
    // }
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start gap-4  sm:items-center justify-between">
        <Button
          onClick={() => router.push("/admin/cars/create")}
          className="flex items-center cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Car
        </Button>
        <form action="" onSubmit={handlesearchsubmit}>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setsearch(e.target.value)}
              type="search"
              placeholder="Search car"
              className="pl-9 w-full sm:w-60"
            />
          </div>
        </form>
      </div>
      {/* cars table */}
    </div>
  );
};

export default CarsList;
