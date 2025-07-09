import { db } from "@/db";
import {brands, brandWithScales, contents,} from "@/db/schema";
import { BrandWithCharacteristicAndScales } from "@/db/types";
import { getSortingStateParser } from "@/lib/datatable/parsers";
import {and, asc, count, desc, eq, gte, ilike, isNotNull, isNull, lte, sql} from "drizzle-orm";
import {createSearchParamsCache, parseAsArrayOf, parseAsBoolean, parseAsInteger, parseAsString} from "nuqs/server";
import { z } from "zod";

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<BrandWithCharacteristicAndScales>().withDefault([
        {id: "name", desc: false},
    ]),
    name: parseAsString.withDefault(""),
    hasContent: parseAsBoolean.withDefault(false),
});

export const getBrands = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
    const offset = (input.page - 1) * input.perPage;

    const where = and(
        input.name ? ilike(brands.name, `%${input.name}%`) : undefined,
        input.hasContent === true ? isNotNull(contents.config) : undefined,
        input.hasContent === false ? isNull(contents.config) : undefined,
    )

    const orderBy =
        input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc ? desc(brands[item.id]) : asc(brands[item.id]),
            )
            : [asc(brands.name)];


    const {data, total} = await db.transaction(async (tx) => {
        const data = await tx.select({
            name: brands.name,
            slug: brands.slug,
            content: contents.config,
            hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
        })
            .from(brands)
            .leftJoin(contents, and(eq(contents.entityId, brands.integrationId), eq(contents.entityType, "brand")))
            .where(where)
            .orderBy(...orderBy)
            .offset(offset)
            .limit(input.perPage)

        const total = await tx
            .select({
                count: count(),
            })
            .from(brands)
            .leftJoin(
                contents,
                and(eq(contents.entityId, brands.integrationId), eq(contents.entityType, 'brand'))
            )
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return {
            data,
            total,
        }
    })

    const pageCount = Math.ceil(total / input.perPage);
    return {data, pageCount};
}