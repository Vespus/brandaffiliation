"use server"

import { actionClient } from "@/lib/action-client";
import { z } from "zod";
import { tasks } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import {revalidatePath} from "next/cache";

export const RemoveTaskAction = actionClient
    .inputSchema(z.object({
        taskId: z.number()
    }))
    .action(async ({parsedInput: {taskId}}) => {
        await db.delete(tasks).where(eq(tasks.id, taskId))
        revalidatePath("/dashboard/batch-studio/tasks")
    })