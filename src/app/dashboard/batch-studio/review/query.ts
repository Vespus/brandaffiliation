import {db} from "@/db";
import {brands, categories, combinations, contents} from "@/db/schema";
import {and, eq, or, sql} from "drizzle-orm";
import {ReviewJoin} from "@/app/dashboard/batch-studio/tasks/type";
import {cache} from "react";

export const getReviewTasks = cache(async () => {
    const reviewContents = await db
        .select({
            content: contents,
            entityName: sql`COALESCE(
            ${brands.name},
            ${categories.name},
            ${combinations.name}
            )`.as("entityName"),
            brand: brands,
            category: categories,
            combination: combinations
        })
        .from(contents)
        .where(eq(contents.needsReview, true))
        .leftJoin(combinations, and(eq(contents.entityType, "combination"), eq(contents.entityId, combinations.integrationId)))
        .leftJoin(categories, and(or(eq(contents.entityType, "combination"), eq(contents.entityType, "category")), or(eq(contents.entityId, categories.integrationId), eq(categories.integrationId, combinations.categoryId))))
        .leftJoin(brands, and(or(eq(contents.entityId, brands.integrationId), eq(contents.entityId, combinations.brandId))))

    return reviewContents as ReviewJoin[]
})

export const getReviewTask = cache(async (id: string) => {
    const [reviewContent] = await db
        .select({
            content: contents,
            entityName: sql`COALESCE(${brands.name},${categories.name},${combinations.name})`.as("entityName"),
            brand: brands,
            category: categories,
            combination: combinations
        })
        .from(contents)
        .where(and(eq(contents.needsReview, true), eq(contents.id, Number(id))))
        .leftJoin(combinations, and(eq(contents.entityType, "combination"), eq(contents.entityId, combinations.integrationId)))
        .leftJoin(categories, and(or(eq(contents.entityType, "combination"), eq(contents.entityType, "category")), or(eq(contents.entityId, categories.integrationId), eq(categories.integrationId, combinations.categoryId))))
        .leftJoin(brands, and(or(eq(contents.entityId, brands.integrationId), eq(contents.entityId, combinations.brandId))))

    return reviewContent as ReviewJoin
})