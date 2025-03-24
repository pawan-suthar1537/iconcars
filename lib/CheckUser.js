import { currentUser } from "@clerk/nextjs/server"
import { db } from "./prisma"

export const CheckUser = async () => {
    const user = await currentUser()
    if (!user) {
        return null
    }

    try {

        const isuserexist = await db.User.findUnique({
            where: {
                clerkUserId: user.id
            }
        })

        if (isuserexist) {
            return isuserexist
        }

        const NewUser = await db.User.create({
            data: {
                clerkUserId: user.id,
                name: `${user.firstName} ${user.lastName}`,
                imageUrl: user.imageUrl,
                email: user.emailAddresses[0].emailAddress,

            }
        })
        return NewUser

    } catch (error) {
        console.log(error)


    }


}