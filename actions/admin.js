"use server";
import { db } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
export async function getAdmin() {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const user = await db.User.findUnique({
        where: { clerkUserId: userId },

    })
    if (!user || user.role !== "ADMIN") {
        return { authorised: false, reason: "not-admin" }
    }
    return { authorised: true, user }
}
