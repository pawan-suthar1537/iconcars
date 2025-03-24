"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Predefined options
const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const transmissions = ["Automatic", "Manual", "Semi-Automatic"];
const bodyTypes = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Convertible",
  "Coupe",
  "Wagon",
  "Pickup",
];
const carStatuses = ["AVAILABLE", "UNAVAILABLE", "SOLD"];

const Addcarform = () => {
  const [activetab, setactivetab] = useState("ai");
  const carFormSchema = z.object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.string().refine((val) => {
      const year = parseInt(val);
      return (
        !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1
      );
    }, "Valid year required"),
    price: z.string().min(1, "Price is required"),
    mileage: z.string().min(1, "Mileage is required"),
    color: z.string().min(1, "Color is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    transmission: z.string().min(1, "Transmission is required"),
    bodyType: z.string().min(1, "Body type is required"),
    seats: z.string().optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    status: z.enum(["AVAILABLE", "UNAVAILABLE", "SOLD"]),
    featured: z.boolean().default(false),
  });

  const {
    register,
    setValue,
    getValues,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      price: "",
      mileage: "",
      color: "",
      fuelType: "",
      transmission: "",
      bodyType: "",
      seats: "",
      description: "",
      status: "AVAILABLE",
      featured: false,
    },
  });

  const onSubmit = async (data) => {};
  return (
    <div>
      <Tabs
        defaultValue="ai"
        className="mt-6 "
        value={activetab}
        onValueChange={setactivetab}
      >
        <TabsList className="grid w-full grid-cols-2 ">
          <TabsTrigger className=" cursor-pointer" value="manual">
            Manual
          </TabsTrigger>
          <TabsTrigger className=" cursor-pointer" value="ai">
            AI Upload
          </TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="mt-6 w-full">
          <Card className="">
            <CardAction>
              <CardHeader>
                <CardTitle>car Details</CardTitle>
                <CardDescription>enter car details </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  action=""
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6 w-full"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-5">
                    {/* name */}
                    <div className="space-y-4">
                      <Label htmlFor="make">Make</Label>
                      <Input
                        id="make"
                        {...register("make")}
                        placeholder="eg. Toyota"
                        className={errors.make ? "border-red-500" : ""}
                      />
                      {errors.make && (
                        <p className="text-xs text-red-500">
                          {errors.make.message}
                        </p>
                      )}
                    </div>
                    {/* model */}
                    <div className="space-y-4">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        {...register("model")}
                        placeholder="eg. Camery"
                        className={errors.model ? "border-red-500" : ""}
                      />
                      {errors.model && (
                        <p className="text-xs text-red-500">
                          {errors.model.message}
                        </p>
                      )}
                    </div>
                    {/* year */}
                    <div className="space-y-4">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        {...register("year")}
                        placeholder="eg. 2000"
                        className={errors.year ? "border-red-500" : ""}
                      />
                      {errors.year && (
                        <p className="text-xs text-red-500">
                          {errors.year.message}
                        </p>
                      )}
                    </div>
                    {/* price */}
                    <div className="space-y-4">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        {...register("price")}
                        placeholder="eg. 10,000"
                        className={errors.price ? "border-red-500" : ""}
                      />
                      {errors.price && (
                        <p className="text-xs text-red-500">
                          {errors.price.message}
                        </p>
                      )}
                    </div>
                    {/* milegae */}
                    <div className="space-y-4">
                      <Label htmlFor="mileage">Mileage</Label>
                      <Input
                        id="mileage"
                        {...register("mileage")}
                        placeholder="eg. 10000"
                        className={errors.mileage ? "border-red-500" : ""}
                      />
                      {errors.mileage && (
                        <p className="text-xs text-red-500">
                          {errors.mileage.message}
                        </p>
                      )}
                    </div>
                    {/* color */}
                    <div className="space-y-4">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        {...register("color")}
                        placeholder="eg. 10000"
                        className={errors.color ? "border-red-500" : ""}
                      />
                      {errors.color && (
                        <p className="text-xs text-red-500">
                          {errors.color.message}
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </CardAction>
          </Card>
        </TabsContent>
        <TabsContent value="ai" className="mt-6">
          Change your password here.
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Addcarform;
