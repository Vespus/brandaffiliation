"use server"

import { actionClient } from "@/lib/action-client";
import { ProfileUpdateSchema } from "@/app/dashboard/profile/schema";
import { db } from "@/db";
import { users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/get-user";
import { eq } from "drizzle-orm";

export const updateProfileAction = actionClient
  .inputSchema(ProfileUpdateSchema)
  .action(async ({ parsedInput }) => {
    const { user } = await getUser();

    await db
      .update(users)
      .set({
        name: parsedInput.name,
        image: parsedInput.image,
      })
      .where(eq(users.id, user.id));

    revalidatePath('/dashboard/profile', 'layout');
  });
