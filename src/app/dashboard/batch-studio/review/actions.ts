"use server";

import { actionClient } from "@/lib/action-client";
import z from "zod";
import { contents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export const removeReviewTask = actionClient
    .inputSchema(z.object({contentId: z.number()}))
    .action(async ({parsedInput}) => {
        if (!parsedInput.contentId) {
            throw new Error("An error occurred while removing review task. ContentId is required")
        }

        const [currentContent] = await db.select().from(contents).where(eq(contents.id, parsedInput.contentId))
        if (currentContent.oldConfig) {
            await db.update(contents)
                .set({
                    oldConfig: null,
                    needsReview: null,
                    config: currentContent.oldConfig
                })
                .where(eq(contents.id, parsedInput.contentId))
        }
        if (!currentContent.oldConfig && currentContent.needsReview) {
            await db.delete(contents).where(eq(contents.id, parsedInput.contentId))
        }

        revalidatePath('/dashboard/batch-studio/review', "layout")
    })