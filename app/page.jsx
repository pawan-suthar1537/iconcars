import CarCard from "@/components/CarCard";
import HomeSearch from "@/components/Home-search";
import { Button } from "@/components/ui/button";
import { featuredCars } from "@/lib/data";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="pt-20 flex flex-col">
      {/* hero */}
      <section className="relative py-10 md:py-22 dotted-bg">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-8xl mb-4 gradiant-title">
              Find your Dream car with ICON CARS
            </h1>
            <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </p>
          </div>
          {/* search */}
          <HomeSearch />
        </div>
      </section>

      {/*  */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold">Featured cars</h2>
            <Button
              className="cursor-pointer flex items-center"
              variant="ghost"
              asChild
            >
              <Link href="/cars">
                {" "}
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car) => {
              return <CarCard key={car.id} car={car} />;
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
