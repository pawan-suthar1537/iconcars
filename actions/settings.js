"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


export async function getDealershipInfo() {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error("Unauthorized")

        const user = await db.User.findUnique({
            where: { clerkUserId: userId },

        })
        if (!user) {
            return { authorised: false, reason: "not-admin" }
        }
        let dealership = await db.DealershipInfo.findFirst({
            include: {
                workingHours: {
                    orderBy: {
                        dayOfWeek: "asc",
                    },
                }

            }
        })
        if (!dealership) {
            dealership = await db.DealershipInfo.create({
                data: {
                    workingHours: {
                        create: [
                            {
                                dayOfWeek: "MONDAY",
                                openTime: "09:00",
                                closeTime: "17:00",
                                isOpen: true,
                            },
                            {
                                dayOfWeek: "TUESDAY",
                                openTime: "09:00",
                                closeTime: "17:00",
                                isOpen: true,
                            },
                            {
                                dayOfWeek: "WEDNESDAY",
                                openTime: "09:00",
                                closeTime: "17:00",
                                isOpen: false,
                            },
                            {
                                dayOfWeek: "THURSDAY",
                                openTime: "09:00",
                                closeTime: "17:00",
                                isOpen: true,
                            },
                            {
                                dayOfWeek: "FRIDAY",
                                openTime: "09:00",
                                closeTime: "17:00",
                                isOpen: true,
                            },
                            {
                                dayOfWeek: "SATURDAY",
                                openTime: "09:00",
                                closeTime: "17:00",
                                isOpen: true,
                            },
                            {
                                dayOfWeek: "SUNDAY",
                                openTime: "09:00",
                                closeTime: "17:00",
                                isOpen: false,
                            },
                        ],
                    },

                },
                include: {
                    workingHours: {
                        orderBy: {
                            dayOfWeek: "asc",
                        },
                    },
                },
            })
        }
        return {
            success: true, data: {
                ...dealership,
                createdAt: dealership.createdAt.toISOString(),
                updatedAt: dealership.updatedAt.toISOString(),
            }
        }

    } catch (error) {
        console.error("Error fetching dealership info:", error);
        throw new Error("Failed to fetch dealership info");


    }
}


export async function saveworkingHour(workinghours) {
    try {
        const { userId } = await auth()
        if (!userId) throw new Error("Unauthorized")

        const user = await db.User.findUnique({
            where: { clerkUserId: userId },

        })
        if (!user || user.role !== "ADMIN") {
            return { authorised: false, reason: "not-admin" }
        }

        const dealership = await db.DealershipInfo.findFirst()
        if (!dealership) {
            return { success: false, message: "Dealership not found" };
        }

        await db.workingHour.deleteMany({
            where: {
                dealershipId: dealership.id,
            },
        })


        for (const hour of workinghours) {
            await db.workingHour.create({
                data: {
                    dealershipId: dealership.id,
                    dayOfWeek: hour.dayOfWeek,
                    openTime: hour.openTime,
                    closeTime: hour.closeTime,
                    isOpen: hour.isOpen,
                }
            })
        }
        revalidatePath("/admin/settings")
        revalidatePath("/")
        return { success: true, message: "Working hours saved successfully" };





    } catch (error) {
        console.error("Error save dealership info:", error);
        throw new Error("Failed to save dealership info");

    }
}