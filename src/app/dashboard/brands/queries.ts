import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
} from "nuqs/server";
import {getFiltersStateParser, getSortingStateParser} from "@/lib/datatable/parsers";
import {Brand, brand, BrandWithCharacteristic} from "@/db/schema";
import {and, asc, count, desc, gt, ilike} from "drizzle-orm";
import { db } from "@/db";

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<Brand>().withDefault([
        { id: "name", desc: false },
    ]),
    name: parseAsString.withDefault(""),
    // advanced filter
    filters: getFiltersStateParser().withDefault([]),
    joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const getBrands = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
    const offset = (input.page - 1) * input.perPage;
    const where = and(
        input.name ? ilike(brand.name, `%${input.name}%`) : undefined,
        gt(brand.attributePrice, 0),
        gt(brand.attributeDesign, 0),
        gt(brand.attributeFame, 0),
        gt(brand.attributeProductRange, 0),
        gt(brand.attributePositioning, 0),
    )

    const orderBy =
        input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc ? desc(brand[item.id]) : asc(brand[item.id]),
            )
            : [asc(brand.name)];

    const { data, total } = await db.transaction(async (tx) => {
        const data = await tx.query.brand.findMany({
            where,
            orderBy,
            offset,
            limit: input.perPage,
            with: {
                characteristic: true,
            }
        }) as BrandWithCharacteristic[]

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
    return { data, pageCount };
}