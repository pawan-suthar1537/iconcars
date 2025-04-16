"use client";
import React, { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Camera, Loader2, Loader2Icon, Upload, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { Addcar, ProcesscarwithAI } from "@/actions/cars";
import { useRouter } from "next/navigation";


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
  const router = useRouter();
  const [activetab, setactivetab] = useState("ai");
  const [uploadimages, setuploadimages] = useState([]);
  const [imageerror, setimageerror] = useState("");
  const [imagePreview, setimagePreview] = useState(null);
  const [UploadAIImage, setUploadAIImage] = useState(null);

  console.log("UploadAIImage", UploadAIImage);

  const {
    loading: ProcesscarwithAIloading,
    fn: ProcesscarwithAIfn,
    data: ProcesscarwithAIdata,
    error: ProcesscarwithAIError,
  } = useFetch(ProcesscarwithAI);

 
  const onMultipleImagesDrop = (acceptedFiles) => {
    const validfiles = acceptedFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceed 5MB limit`);
        return false;
      }
      return true;
    });

    if (validfiles.length === 0) return;

    const newImages = [];
    validfiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        newImages.push(e.target.result);
        if (newImages.length === validfiles.length) {
          setuploadimages((prev) => [...prev, ...newImages]);
          setimageerror("");
          toast.success(`Images Uploaded ${validfiles.length} images`);
        }
      };
      reader.onerror = () => {
        toast.error("Error uploading image");
      };
      reader.readAsDataURL(file);
    });
  };


  const { getRootProps: getMultiRootProps, getInputProps: getMultiInputProps } =
    useDropzone({
      onDrop: onMultipleImagesDrop,
      accept: {
        "/image/*": [".jpg", ".jpeg", ".png", ".webp"],
      },
      multiple: true,
    });

  

  const onAIDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image Size Must be less than 5mb");
        return;
      }
      setUploadAIImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setimagePreview(e.target.result);
        toast.success("Image Uploaded");
      };
      reader.onerror = () => {
        setisuploading(false);
        toast.error("Error uploading image");
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps: getAIRootProps, getInputProps: getAIInputProps } =
    useDropzone({
      onDrop: onAIDrop,
      accept: {
        "/image/*": [".jpg", ".jpeg", ".png", ".webp"],
      },
      multiple: false,
      maxFiles: 1,
    });
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
  const {
    data: addcarres,
    loading: addcarloading,
    fn: addcarfn,
  } = useFetch(Addcar);

  useEffect(() => {
    console.log("ProcesscarwithAIdata updated:", ProcesscarwithAIdata);
    if (ProcesscarwithAIdata?.success) {
      const carDetailss = ProcesscarwithAIdata.data;

      console.log("carDetailss", carDetailss);
      setValue("make", carDetailss.make);
      setValue("model", carDetailss.model);
      setValue("year", carDetailss.year.toString());
      setValue("color", carDetailss.color);
      setValue("bodyType", carDetailss.bodyType);
      setValue("fuelType", carDetailss.fuelType);
      setValue("price", carDetailss.price.toString());
      setValue("mileage", carDetailss.mileage);
      setValue("transmission", carDetailss.transmission);

      setValue("description", carDetailss.description);

      const reader = new FileReader();
      reader.onload = (e) => {
        setuploadimages((prev) => [...prev, e.target.result]);
      };
      reader.onerror = () => {
        toast.error("Error uploading image");
      };
      reader.readAsDataURL(UploadAIImage);
      toast.success("Car details extracted successfully", {
        description: `Detected ${carDetailss.year} ${carDetailss.make} ${
          carDetailss.model
        } with ${Math.round(carDetailss.confidence * 100)}% confidence`,
      });
      setactivetab("manual");
      console.log("Tab set to manual");
    }
  }, [ProcesscarwithAIdata, UploadAIImage, setValue]);
  useEffect(() => {
    if (ProcesscarwithAIError) {
      toast.error(
        ProcesscarwithAIError.message || "Error Processing image with AI"
      );
    }
  }, [ProcesscarwithAIError]);

  useEffect(() => {
    if (addcarres?.success) {
      toast.success("car added successfully");
      router.push("/admin/cars");
    }
  }, [addcarres, addcarloading]);
  const onSubmit = async (data) => {
    if (uploadimages.length === 0) {
      setimageerror("please upload at least one image");
      return;
    }

    console.log("add car data", data);
    const carDataa = {
      ...data,
      year: parseInt(data.year),
      price: parseFloat(data.price),
      mileage: parseInt(data.mileage),
      seats: data.seats ? parseInt(data.seats) : null,
    };

    await addcarfn({
      carData: carDataa,
      images: uploadimages,
    });
  };
  const removeimage = async (index) => {
    setuploadimages((prev) => prev.filter((_, i) => i !== index));
  };

  const ProcessWithAI = async () => {
    if (!UploadAIImage) {
      toast.error("Please upload image first");
      return;
    }
    await ProcesscarwithAIfn(UploadAIImage);
  };

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
        {/* manual */}
        <TabsContent value="manual" className="mt-6">
          <Card className="w-full">
            <CardAction className="w-full">
              <CardHeader>
                <CardTitle>car Details</CardTitle>
                <CardDescription>enter car details </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6 w-full"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
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
                    {/* Fuel type */}
                    <div className="space-y-4">
                      <Label htmlFor="color">Fuel Type</Label>
                      <Select
                        onValueChange={(value) => setValue("fuelType", value)}
                        defaultValue={getValues("fuelType")}
                      >
                        <SelectTrigger
                          className={errors.fuelType ? "text-red-500 " : ""}
                        >
                          <SelectValue placeholder="Select Fuel Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {fuelTypes.map((f, i) => {
                            return (
                              <SelectItem value={f} key={f}>
                                {f}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>

                      {errors.fuelType && (
                        <p className="text-xs text-red-500">
                          {errors.fuelType.message}
                        </p>
                      )}
                    </div>
                    {/* transmission */}
                    <div className="space-y-4">
                      <Label htmlFor="transmission">Transmission</Label>
                      <Select
                        onValueChange={(value) =>
                          setValue("transmission", value)
                        }
                        defaultValue={getValues("transmission")}
                      >
                        <SelectTrigger
                          className={errors.transmission ? "text-red-500 " : ""}
                        >
                          <SelectValue placeholder="Select transmission" />
                        </SelectTrigger>
                        <SelectContent>
                          {transmissions.map((f, i) => {
                            return (
                              <SelectItem value={f} key={f}>
                                {f}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>

                      {errors.transmission && (
                        <p className="text-xs text-red-500">
                          {errors.transmission.message}
                        </p>
                      )}
                    </div>
                    {/* body type */}
                    <div className="space-y-4">
                      <Label htmlFor="bodyType">Body Type</Label>
                      <Select
                        onValueChange={(value) => setValue("bodyType", value)}
                        defaultValue={getValues("bodyType")}
                      >
                        <SelectTrigger
                          className={errors.fuelType ? "text-red-500 " : ""}
                        >
                          <SelectValue placeholder="Select body Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {bodyTypes.map((f, i) => {
                            return (
                              <SelectItem value={f} key={f}>
                                {f}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>

                      {errors.bodyType && (
                        <p className="text-xs text-red-500">
                          {errors.bodyType.message}
                        </p>
                      )}
                    </div>
                    {/* number of seats */}
                    <div className="space-y-4">
                      <Label htmlFor="seats">
                        Number of Seats
                        <span className="text-sm text-gray-500">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="seats"
                        {...register("seats")}
                        placeholder="eg. 5"
                      />
                    </div>
                    {/* status */}
                    <div className="space-y-4">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        onValueChange={(value) => setValue("status", value)}
                        defaultValue={getValues("status") || ""}
                      >
                        <SelectTrigger
                          className={errors.status ? "text-red-500 " : ""}
                        >
                          <SelectValue placeholder="Select car status" />
                        </SelectTrigger>
                        <SelectContent>
                          {carStatuses.map((f, i) => {
                            return (
                              <SelectItem value={f} key={f}>
                                {f.charAt(0) + f.slice(1).toLowerCase()}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* description  */}
                  <div className="space-y-4">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="description"
                      className={` min-h-32 w-full${
                        errors.description ? "border-red-500" : ""
                      }`}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                  {/* featured checkbox */}
                  <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer">
                    <Checkbox
                      id="featured"
                      className="cursor-pointer"
                      checked={watch("featured")}
                      onCheckedChange={(checked) =>
                        setValue("featured", checked)
                      }
                    />
                    <div className="space-y-1 leading-none cursor-pointer">
                      <Label htmlFor="featured">Feature this car</Label>
                      <p className="text-sm text-gray-500">
                        Featured cars appear on homepage top
                      </p>
                    </div>
                  </div>
                  {/* images */}
                  <div>
                    <label
                      htmlFor="images"
                      className={imageerror ? "text-red-500" : ""}
                    >
                      Images
                      {imageerror && <span className="text-red-500">*</span>}
                    </label>
                    <div>
                      <div
                        {...getMultiRootProps()}
                        className={`cursor-pointer border-2 border-dashed rounded-lg mt-2 p-6 text-center hover:bg-gray-50 transition ${
                          imageerror ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <input {...getMultiInputProps()} />
                        <div className="flex flex-col items-center justify-center">
                          <Upload className="h-12 w-12 text-gray-500 mb-3" />
                          <p className="text-sm text-gray-600">
                            Drag & Drop or click to upload multiple images{" "}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Supports: JPG, PNG (max 5MB each)
                          </p>
                        </div>
                      </div>

                      {imageerror && (
                        <p className="text-xs text-red-500 mt-1">
                          {imageerror}
                        </p>
                      )}

                      {uploadimages.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium mb-2">
                            Uploaded Images ({uploadimages.length})
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {uploadimages.map((img, i) => {
                              return (
                                <div key={i} className="relative group">
                                  <Image
                                    src={img}
                                    alt={`Car image ${i + 1}`}
                                    height={50}
                                    width={50}
                                    className="h-28 w-full object-cover rounded-md"
                                    priority
                                  />
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeimage(i)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full md:w-auto cursor-pointer"
                    disabled={addcarloading}
                  >
                    {addcarloading ? (
                      <>
                        {" "}
                        <Loader2 className="mr-1 h-4 w-4  animate-spin" />{" "}
                        adding car
                      </>
                    ) : (
                      "Add Car"
                    )}
                  </Button>
                </form>
              </CardContent>
            </CardAction>
          </Card>
        </TabsContent>
        {/* AI */}
        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Powerd car details Extraction</CardTitle>
              <CardDescription>
                Upload an image of a car and let AI extract details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition">
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={imagePreview}
                        alt="carpreview"
                        className="max-h-56 max-w-full object-contain mb-4"
                      />
                      <div className="flex gap-2">
                        <Button
                          className="cursor-pointer"
                          variant={"outline"}
                          size="sm"
                          onClick={() => {
                            setimagePreview(null);
                            setUploadAIImage(null);
                          }}
                        >
                          Remove
                        </Button>
                        <Button
                          className="cursor-pointer"
                          size="sm"
                          onClick={ProcessWithAI}
                          disabled={ProcesscarwithAIloading}
                        >
                          {ProcesscarwithAIloading ? (
                            <>
                              <Loader2 className=" h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Camera className="mr-2 h-4 w-4" /> Extract
                              Details
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      {...getAIRootProps()}
                      className="cursor-pointer hover:bg-gray-50 transition"
                    >
                      <input {...getAIInputProps()} />
                      <div className="flex flex-col items-center justify-center">
                        <Camera className="h-12 w-12  text-gray-500 text-sm mb-2" />
                        <p>Drag & Drop car image for search</p>

                        <p className="text-gray-500 text-xs mt-1">
                          Supports: JPG,PNG,WEBP (max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Addcarform;
