"use server"

import {actionClient} from "@/lib/action-client";
import z from "zod";
import {db} from "@/db";
import {tasks} from "@/db/schema";

export const saveTask = actionClient
    .inputSchema(
        z.array(
            z.object({
                entityType: z.string(),
                entityId: z.string(),
                status: z.string(),
                specification: z.any(),
                old_value: z.any()
            })
        )
    )
    .action(async ({parsedInput}) => {
        await db.insert(tasks)
            .values(parsedInput)
    })