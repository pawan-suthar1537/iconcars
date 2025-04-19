"use server";
import { serializeCarData } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { createClient } from "@/lib/Supabase";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

async function convertfilebs64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

export async function ProcesscarwithAI(file) {
 
  try {
    
    if (!process.env.GEMENI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const genai = new GoogleGenerativeAI(process.env.GEMENI_API_KEY);
    const model = await genai.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const base64 = await convertfilebs64(file);

    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: file.type || "image/jpeg",
      },
    };
    const Prompt = `
        Analyze this car image and extract this foloowing information:
        1. Make(manufacturer)
        2.Model
        3. Year (apporximately in YYYY format)
        4.Color
        5.BodyType ("SUV",
  "Sedan",
  "Hatchback",
  "Convertible",
  "Coupe",
  "Wagon",
  "Pickup",)
        6. mileage (apporximately in km or miles)
        7. fule type ("Petrol", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid")
        8.transmission type (Automatic", "Manual", "Semi-Automatic")
        9. price (YOur best guess and give a number not in range)
        10.short description of the car

        format YOur Response in JSON format with the following
        {
            "make": "",
            "model": "",
            "year": "0000",
            "color": "color",
            "price": "price",
            "mileage": "mileage",
            "bodyType": "bodyType",
            "fuelType": "fuelType",
            transmission: "transmission",
            "description": "description",
            confidence: "0.00"


            
        }

        for the confidence, use 0.00 to 1 represent the confidence level of the model
        respond wuth the JSON format only, nothing else

        `;

    const result = await model.generateContent([imagePart, Prompt]);
    const response = await result.response;
    const text = await response.text();
    
    const cleantext = text.replace(/```json\s*|```|\bjson\b\s*/g, "").trim();
    

    try {
      const car_details = JSON.parse(cleantext);
      const requiredfields = [
        "make",
        "model",
        "year",
        "color",
        "price",
        "mileage",
        "bodyType",
        "fuelType",
        "transmission",
        "description",
        "confidence",
      ];

      const missingfields = requiredfields.filter(
        (field) => !(field in car_details)
      );
      if (missingfields.length > 0) {
        throw new Error(`Missing fields: ${missingfields.join(", ")}`);
      }

      return {
        success: true,
        data: car_details,
      };
    } catch (error) {
      console.error(
        "JSON parsing error:",
        error.message,
        "Cleantext was:",
        cleantext
      );
      return { success: false, error: "Invalid JSON format" };
    }
  } catch (error) {
    throw new Error("Error processing image with AI " + error.message);
  }
}

export async function Addcar({ carData, images }) {
  console.log("Car Data", carData, images);
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.User.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      return { authorised: false, reason: "not-admin" };
    }

    const carid = uuidv4();
    const folderpath = `cars/${carid}`;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      const convertfilebs64 = images[i];

      if (!convertfilebs64 || !convertfilebs64.startsWith("data:image/")) {
        console.warn("Invalid image data");
        continue;
      }
      const base64 = convertfilebs64.split(",")[1];
      const imagebuffer = Buffer.from(base64, "base64");

      const mimetype = convertfilebs64.match(/data:image\/([a-zA-Z0-9]+);/);
      const filetype = mimetype ? mimetype[1] : ".png";

      const filename = `image-${Date.now()}-${i}.${filetype}`;
      const filepath = `${folderpath}/${filename}`;

      const { data, error } = await supabase.storage
        .from("iconcars")
        .upload(filepath, imagebuffer, {
          contentType: `image/${mimetype}`,
        });

      if (error) {
        console.error("Error uploading image:", error);
        throw new Error("Error uploading image");
      }

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/iconcars/${filepath}`;

      imageUrls.push(publicUrl);
    }

    if (imageUrls.length === 0) {
      throw new Error("No images uploaded");
    }

    const car = await db.Car.create({
      data: {
        id: carid,
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        mileage: carData.mileage || 0,
        color: carData.color,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        bodyType: carData.bodyType,
        images: imageUrls,
        seats: carData.seats,
        status: carData.status,
        featured: carData.featured,
        description: carData.description,
      },
    });

    const serializedCar = {
      ...car,
      price: car.price.toNumber(),
    };

    revalidatePath("/admin/cars");
    return {
      success: true,
      car: serializedCar,
    };
  } catch (error) {
    throw new Error("Error in adding car" + error.message);
  }
}

export async function getallCars(search = "") {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.User.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      return { authorised: false, reason: "not-admin" };
    }

    let where = {};
    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
      ];
    }

    const cars = await db.Car.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });
    const serializeddata = cars.map(serializeCarData);
    return {
      success: true,
      data: serializeddata,
    };
  } catch (error) {
    console.error("Error fetching cars:", error);
    return {
      success: false,
      error: "Error fetching cars",
    };
  }
}

export async function DeleteCar(carId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.User.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      return { authorised: false, reason: "not-admin" };
    }

    const car = await db.Car.findUnique({
      where: { id: carId },
      select: { images: true },
    });
    if (!car) {
      return { success: false, error: "Car not found" };
    }
    await db.Car.delete({
      where: { id: carId },
    });
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);

      const filepaths = car.images
        .map((imgurl) => {
          const url = new URL(imgurl);
          const path = url.pathname.match(/\/iconcars\/(.*)/);
          return path ? path[1] : null;
        })
        .filter(Boolean);

      if (filepaths.length > 0) {
        const { error } = await supabase.storage
          .from("iconcars")
          .remove(filepaths);
      }
      if (error) {
        console.error("Error deleting images from Supabase:", error);
      }
    } catch (storagerror) {
      console.error("Error deleting car:", storagerror);
      return {
        success: false,
        error: "Error deleting car",
      };
    }
    revalidatePath("/admin/cars");
    return {
      success: true,
      message: "Car deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting car:", error);
    return {
      success: false,
      error: "Error deleting car",
    };
  }
}

export async function UpdateCar(carId, { status, featured }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.User.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      return { authorised: false, reason: "not-admin" };
    }

    const updatedData = {};
    if (status !== undefined) updatedData.status = status;
    if (featured !== undefined) updatedData.featured = featured;

    const car = await db.Car.update({
      where: { id: carId },
      data: updatedData,
    });

    const serializedCar = {
      ...car,
      price: car.price.toNumber(),
    };
    revalidatePath("/admin/cars");
    return {
      success: true,
      car: serializedCar,
    };
  } catch (error) {
    console.error("Error updating car:", error);
    return {
      success: false,
      error: "Error updating car",
    };
  }
}
