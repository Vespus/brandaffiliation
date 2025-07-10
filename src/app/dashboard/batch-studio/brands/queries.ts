import {db} from "@/db";
import {brands, contents,} from "@/db/schema";
import {BrandWithCharacteristicAndScales} from "@/db/types";
import {getSortingStateParser} from "@/lib/datatable/parsers";
import {and, asc, count, desc, eq, ilike, isNotNull, isNull, sql} from "drizzle-orm";
import {createSearchParamsCache, parseAsInteger, parseAsString} from "nuqs/server";
import {BatchStudioBrandType} from "@/app/dashboard/batch-studio/brands/batch-studio-brand-type";

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<BrandWithCharacteristicAndScales>().withDefault([
        {id: "name", desc: false},
    ]),
    name: parseAsString.withDefault(""),
    content: parseAsString
});

export const getBrands = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
    const offset = (input.page - 1) * input.perPage;

    const where = and(
        input.name ? ilike(brands.name, `%${input.name}%`) : undefined,
        input.content === "yes" ? isNotNull(contents.config) : undefined,
        input.content === "no" ? isNull(contents.config) : undefined
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
            integrationId: brands.integrationId,
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
            .leftJoin(contents, and(eq(contents.entityId, brands.integrationId), eq(contents.entityType, "brand")))
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return {
            data: data as BatchStudioBrandType[],
            total,
        }
    })

    const pageCount = Math.ceil(total / input.perPage);
    return {data, pageCount};
}