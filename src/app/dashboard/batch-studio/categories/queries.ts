import { BatchStudioCategoryType } from "@/app/dashboard/batch-studio/categories/batch-studio-category-type";
import { db } from "@/db";
import { categories, contents, } from "@/db/schema";
import { Category } from "@/db/types";
import { getSortingStateParser } from "@/lib/datatable/parsers";
import { and, asc, count, desc, eq, ilike, isNotNull, isNull, sql } from "drizzle-orm";
import { createSearchParamsCache, parseAsInteger, parseAsString } from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<Category>().withDefault([
        {id: "name", desc: false},
    ]),
    name: parseAsString.withDefault(""),
    content: parseAsString
});

export const getCategories = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
    const offset = (input.page - 1) * input.perPage;

    const where = and(
        input.name ? ilike(categories.name, `%${input.name}%`) : undefined,
        input.content === "yes" ? isNotNull(contents.config) : undefined,
        input.content === "no" ? isNull(contents.config) : undefined
    )

    const orderBy =
        input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc ? desc(categories[item.id]) : asc(categories[item.id]),
            )
            : [asc(categories.name)];


    const {data, total} = await db.transaction(async (tx) => {
        const data = await tx.select({
            name: categories.name,
            description: categories.description,
            slug: categories.slug,
            content: contents.config,
            integrationId: categories.integrationId,
            hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
        })
            .from(categories)
            .leftJoin(contents, and(eq(contents.entityId, categories.integrationId), eq(contents.entityType, "category")))
            .where(where)
            .orderBy(...orderBy)
            .offset(offset)
            .limit(input.perPage)

        const total = await tx
            .select({
                count: count(),
            })
            .from(categories)
            .leftJoin(contents, and(eq(contents.entityId, categories.integrationId), eq(contents.entityType, "category")))
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return {
            data: data as unknown as BatchStudioCategoryType[],
            total,
        }
    })

    const pageCount = Math.ceil(total / input.perPage);
    return {data, pageCount, total};
}