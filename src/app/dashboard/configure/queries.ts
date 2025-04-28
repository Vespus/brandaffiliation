import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsString,
    parseAsArrayOf
} from "nuqs/server";
import {getSortingStateParser} from "@/lib/datatable/parsers";
import {Brand, brand} from "@/db/schema";
import {and, asc, count, desc, gte, ilike, lte} from "drizzle-orm";
import {db} from "@/db";
import {z} from "zod";


export const getBrands = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
    const offset = (input.page - 1) * input.perPage;

    const where = and(
        input.name ? ilike(brand.name, `%${input.name}%`) : undefined,
        input.price.length > 0
            ? and(
                input.price[0] ? gte(brand.price, input.price[0]) : undefined,
                input.price[1] ? lte(brand.price, input.price[1]) : undefined
            )
            : undefined,
        input.quality.length > 0
            ? and(
                input.quality[0] ? gte(brand.quality, input.quality[0]) : undefined,
                input.quality[1] ? lte(brand.quality, input.quality[1]) : undefined
            )
            : undefined,
        input.focus.length > 0
            ? and(
                input.focus[0] ? gte(brand.focus, input.focus[0]) : undefined,
                input.focus[1] ? lte(brand.focus, input.focus[1]) : undefined
            )
            : undefined,
        input.positioning.length > 0
            ? and(
                input.positioning[0] ? gte(brand.positioning, input.positioning[0]) : undefined,
                input.positioning[1] ? lte(brand.positioning, input.positioning[1]) : undefined
            )
            : undefined,
        input.heritage.length > 0
            ? and(
                input.heritage[0] ? gte(brand.heritage, input.heritage[0]) : undefined,
                input.heritage[1] ? lte(brand.heritage, input.heritage[1]) : undefined
            )
            : undefined,
        input.origin.length > 0
            ? and(
                input.origin[0] ? gte(brand.origin, input.origin[0]) : undefined,
                input.origin[1] ? lte(brand.origin, input.origin[1]) : undefined
            )
            : undefined,
        input.fame.length > 0
            ? and(
                input.fame[0] ? gte(brand.fame, input.fame[0]) : undefined,
                input.fame[1] ? lte(brand.fame, input.fame[1]) : undefined
            )
            : undefined,
        input.sales_volume.length > 0
            ? and(
                input.sales_volume[0] ? gte(brand.sales_volume, input.sales_volume[0]) : undefined,
                input.sales_volume[1] ? lte(brand.sales_volume, input.sales_volume[1]) : undefined
            )
            : undefined,
    )

    const orderBy =
        input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc ? desc(brand[item.id]) : asc(brand[item.id]),
            )
            : [asc(brand.name)];


    const {data, total} = await db.transaction(async (tx) => {
        const data = await tx.query.brand.findMany({
            where,
            orderBy,
            offset,
            limit: input.perPage,
            with: {
                characteristic: true,
            }
        })

        const total = await tx
            .select({
                count: count(),
            })
            .from(brand)
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