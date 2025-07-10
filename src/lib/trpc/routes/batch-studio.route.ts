import { QSPayClient } from "@/lib/qs-pay-client";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/trpc";
import {QSPayBrand, QSPayCategory, QSPayCombin, QSPayUser} from "@/qspay-types";
import { z } from "zod";
import {brands, contents} from "@/db/schema";
import {and, eq, isNotNull, sql} from "drizzle-orm";
import {db} from "@/db";

export const batchStudioRoute = createTRPCRouter({
    getAllBrands: publicProcedure
        .query(async () => {
            const data = await db.select({
                name: brands.name,
                slug: brands.slug,
                content: contents.config,
                integrationId: brands.integrationId,
                hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            })
                .from(brands)
                .leftJoin(contents, and(eq(contents.entityId, brands.integrationId), eq(contents.entityType, "brand")))

            return data
        }),
    getAllBrandsWithNoContent: publicProcedure
        .query(async () => {
            const data = await db.select({
                name: brands.name,
                slug: brands.slug,
                content: contents.config,
                integrationId: brands.integrationId,
                hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            })
                .from(brands)
                .leftJoin(contents, and(eq(contents.entityId, brands.integrationId), eq(contents.entityType, "brand")))
                .where(isNotNull(contents.config))
            return data
        }),
})
