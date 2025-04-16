"use client";
import { DeleteCar, getallCars, UpdateCar } from "@/actions/cars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useFetch from "@/hooks/use-fetch";
import { formatCurrency } from "@/lib/helper";
import {
  CarIcon,
  Eye,
  EyeIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  StarOff,
  Trash2,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const CarsList = () => {
  const router = useRouter();
  const [search, setsearch] = useState("");

  const {
    loading: getallcarsloading,
    fn: getallcarsfn,
    error: getallcarserror,
    data: getallcarsdata,
  } = useFetch(getallCars);
  const {
    loading: UpdateCarloading,
    fn: UpdateCarfn,
    error: UpdateCarserror,
    data: UpdateCardata,
  } = useFetch(UpdateCar);
  const {
    loading: DeleteCarloading,
    fn: DeleteCarfn,
    error: DeleteCarerror,
    data: DeleteCardata,
  } = useFetch(DeleteCar);

  useEffect(() => {
    if (DeleteCardata?.success) {
      toast.success("Car deleted successfully");
      getallcarsfn(search);
    }
    if (UpdateCardata?.success) {
      toast.success("Car updated successfully");
      getallcarsfn(search);
    }
  }, [UpdateCardata, DeleteCardata]);

  useEffect(() => {
    if (getallcarserror) {
      toast.error("Failed to load cars");
    }
    if (UpdateCarserror) {
      toast.error("Failed to update car");
    }
    if (DeleteCarerror) {
      toast.error("Failed to delete car");
    }
  }, [getallcarserror, UpdateCarserror, DeleteCarerror]);

  useEffect(() => {
    getallcarsfn(search);
  }, [search]);

 
  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Available
          </Badge>
        );
      case "UNAVAILABLE":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Unavailable
          </Badge>
        );
      case "SOLD":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Sold
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlesearchsubmit = (e) => {
    e.preventDefault();
    
    getallcarsfn(search);
  };

  const handletogglefeaturecar = async (car) => {
    await UpdateCarfn(car.id, { featured: !car.featured });
  };
  const handlestatusupdatecar = async (car, newstatus) => {
    await UpdateCarfn(car.id, { status: newstatus });
  };
  const handledeletecar = async (car) => {
    await DeleteCarfn(car.id);
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
      <Card>
        <CardContent className="p-0">
          {getallcarsloading && !getallcarsdata ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
          ) : getallcarsdata?.success && getallcarsdata.data.length > 0 ? (
            <div className="overflow-x-auto ">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getallcarsdata.data.map((car) => {
                    console.log("car in carslist", car);
                    return (
                      <TableRow key={car.id}>
                        <TableCell className="w-1- h-10 rounded-md overflow-hidden">
                          {car?.images && car.images.length > 0 ? (
                            <Image
                              src={car.images[0]}
                              alt={`${car.make} ${car.model}`}
                              height={40}
                              width={40}
                              className="w-full h-full object-cover"
                              priority
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <CarIcon className="h-8 w-8 text-gray-500" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {car.make} {car.model}
                        </TableCell>
                        <TableCell>{car.year}</TableCell>
                        <TableCell>{formatCurrency(car.price)}</TableCell>
                        <TableCell>{getStatusBadge(car.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-9 w-9 cursor-pointer"
                            onClick={() => handletogglefeaturecar(car)}
                            disabled={UpdateCarloading}
                          >
                            {car.featured ? (
                              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                            ) : (
                              <StarOff className="h-5 w-5 text-gray-400" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant={"ghost"}
                                size="sm"
                                className="p-0 h-8 w-8 cursor-pointer"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>

                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => router.push(`/cars/${car.id}`)}
                              >
                                <Eye className="h-4 w-4 mr-2" /> View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Status</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  handlestatusupdatecar(car, "AVAILABLE")
                                }
                                disabled={
                                  car.status === "AVAILABLE" || UpdateCarloading
                                }
                                className="cursor-pointer"
                              >
                                Set Available
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handlestatusupdatecar(car, "UNAVAILABLE")
                                }
                                disabled={
                                  car.status === "UNAVAILABLE" ||
                                  UpdateCarloading
                                }
                                className="cursor-pointer"
                              >
                                Set UnAvailable
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handlestatusupdatecar(car, "SOLD")
                                }
                                disabled={
                                  car.status === "SOLD" || UpdateCarloading
                                }
                                className="cursor-pointer"
                              >
                                Mark as Sold
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handledeletecar(car)}
                                className="cursor-pointer text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <CarIcon className="h-12 w-12 text-gray-400 mb-4 " />
              <h3 className="text-lg font-medium mb-1 text-gray-900">
                No cars Found
              </h3>
              <p className="text-gray-500 mb-4">
                {search
                  ? "No car matches your search"
                  : "Add a car to get started inventory is empty"}
              </p>
              <Button
                className="cursor-pointer"
                onClick={() => router.push("/admin/cars/create")}
              >
                <Plus className="h-4 w-4" />
                Add Car
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CarsList;
