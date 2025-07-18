import {db} from "@/db";
import {brands, categories, combinations, contents,} from "@/db/schema";
import {BrandWithCharacteristicAndScales} from "@/db/types";
import {getSortingStateParser} from "@/lib/datatable/parsers";
import {and, asc, count, desc, eq, ilike, isNotNull, isNull, sql} from "drizzle-orm";
import {createSearchParamsCache, parseAsInteger, parseAsString} from "nuqs/server";
import {BatchStudioCombinationType} from "@/app/dashboard/batch-studio/combinations/batch-studio-combination-type";

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<BrandWithCharacteristicAndScales>().withDefault([
        {id: "name", desc: false},
    ]),
    name: parseAsString.withDefault(""),
    content: parseAsString
});

export const getCombinations = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
    const offset = (input.page - 1) * input.perPage;

    const where = and(
        input.name ? ilike(combinations.name, `%${input.name}%`) : undefined,
        input.content === "yes" ? isNotNull(contents.config) : undefined,
        input.content === "no" ? isNull(contents.config) : undefined
    )

    const orderBy =
        input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc ? desc(combinations[item.id]) : asc(combinations[item.id]),
            )
            : [asc(combinations.name)];


    const {data, total} = await db.transaction(async (tx) => {
        const data = await tx.select({
            name: combinations.name,
            description: combinations.description,
            content: contents.config,
            integrationId: combinations.integrationId,
            hasContent: sql<boolean>`(${contents.config} IS NOT NULL)`.as('hasContent'),
            brand: brands.name,
            category: categories.name,
        })
            .from(combinations)
            .leftJoin(contents, and(eq(contents.entityId, combinations.integrationId), eq(contents.entityType, "combination")))
            .leftJoin(brands, and(eq(combinations.brandId, brands.integrationId)))
            .leftJoin(categories, and(eq(combinations.categoryId, categories.integrationId)))
            .where(where)
            .orderBy(...orderBy)
            .offset(offset)
            .limit(input.perPage)

        const total = await tx
            .select({
                count: count(),
            })
            .from(combinations)
            .leftJoin(contents, and(eq(contents.entityId, combinations.integrationId), eq(contents.entityType, "combination")))
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return {
            data: data as unknown as BatchStudioCombinationType[],
            total,
        }
    })

    const pageCount = Math.ceil(total / input.perPage);
    return {data, pageCount, total};
}