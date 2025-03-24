import { db } from "@/lib/prisma";
import { createClient } from "@/lib/Supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

import { cookies } from "next/headers";
import uuidv4 from "uuid";

async function convertfilebs64(file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    return buffer.toString('base64');
}



export async function ProcesscarwithAI(file) {
    try {
        if (!process.env.GEMENI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set");
        }

        const genai = new GoogleGenerativeAI(process.env.GEMENI_API_KEY);
        const model = await genai.getGenerativeModel({
            model: "gemini-5.1-flash",
        });

        const base64 = await convertfilebs64(file);

        const imagePart = {
            inlineData: {
                data: base64,
                mimeType: file.type,
            },

        }
        const Prompt = `
        Analyze this car image and extract this foloowing information:
        1. Make(manufacturer)
        2.Model
        3. Year (apporximately)
        4.Color
        5.BodyType (suv,sedan,hatchback, etc)
        6. mileage (apporximately)
        7. fule type (petrol, diesel, electric, hybrid)
        8.transmission type (manual, automatic)
        9. price (YOur best guess)
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
            transmissionType: "transmissionType",
            "description": "description",
            confidence: "0.00"
        }

        for the confidence, use 0.00 to 1 represent the confidence level of the model
        respond wuth the JSON format only, nothing else

        `


        const result = await model.generateContent([imagePart, Prompt])
        const response = await result.response;
        const text = await response.text();
        const cleantext = text.replace(/```(?:json )?\n?/g, "").trim();


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
                "transmissionType",
                "description",
                "confidence"

            ]

            const missingfields = requiredfields.filter((field) => !(field in car_details));
            if (missingfields.length > 0) {
                throw new Error(`Missing fields: ${missingfields.join(", ")}`);
            }

            return {
                success: true,
                data: car_details
            }

        } catch (error) {
            return {
                success: false,
                error: "Invalid JSON format",

            }

        }

    } catch (error) {

        throw new Error("Error processing image with AI" + error.message);

    }

}


export async function Addcar({ carData, images }) {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error("Unauthorized")

        const user = await db.User.findUnique({
            where: { clerkUserId: userId },

        })
        if (!user) {
            return { authorised: false, reason: "not-admin" }
        }

        const carid = uuidv4();
        const folderpath = `cars/${carid}`;

        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const imageUrls = []

        for (let i = 0; i < images.length; i++) {
            const convertfilebs64 = images[i]

            if (!convertfilebs64 || !convertfilebs64.startsWith("data:image/")) {
                console.warn("Invalid image data");
                continue;
            };
            const base64 = convertfilebs64.split(",")[1];
            const imagebuffer = Buffer.from(base64, "base64");

            const mimetype = base64.match(/data:image\/([a-zA-Z0-9]+);/);
            const filetype = mimetype ? mimetype[1] : "png";

            const filename = `image-${Date.now()}-${i}.${filetype}`;
            const filepath = `${folderpath}/${filename}`;

            const { data, error } = await supabase.storage
                .from("car-images")
                .upload(filepath, imagebuffer, {
                    contentType: `image/${mimetype}`,

                })

            if (error) {
                console.error("Error uploading image:", error);
                throw new Error("Error uploading image");
            }

            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/car-images/${filepath}`;

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
                mileage: carData.mileage,
                color: carData.color,
                bodyType: carData.bodyType,
                fuelType: carData.fuelType,
                transmission: carData.transmissionType,
                description: carData.description,
                images: imageUrls,
            }
        })

        revalidatePath("/admin/cars");
        return {
            success: true,
            car: car,
        }

    } catch (error) {
        throw new Error("Error in adding car" + error.message)

    }

}