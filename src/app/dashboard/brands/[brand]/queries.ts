import { db } from "@/db";
import { aliasedTable, asc, eq, getTableColumns, ne, sql, ViewBaseConfig } from 'drizzle-orm';
import { brandWithScales, brands, BrandWithCharacteristicAndScales } from '@/db/schema';
import { createSearchParamsCache, parseAsFloat } from "nuqs/server";
import { DEFAULT_SCALE_WEIGHTS } from "@/app/dashboard/brands/[brand]/constant";

export const searchParamsCache = createSearchParamsCache({
    price: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.price),
    quality: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.quality),
    focus: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.focus),
    design: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.design),
    positioning: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.positioning),
    heritage: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.heritage),
    origin: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.origin),
    recognition: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.recognition),
    revenue: parseAsFloat.withDefault(DEFAULT_SCALE_WEIGHTS.revenue),
});

/**
 * Finds most similar brands to a target brand by its name using weighted scales.
 */
export async function findSimilarityByScale(
    brand: BrandWithCharacteristicAndScales,
    customWeights: Record<keyof typeof DEFAULT_SCALE_WEIGHTS, number>,
    limit = 5
) {
    const scaleColumns = Object.keys(customWeights) as (keyof typeof DEFAULT_SCALE_WEIGHTS)[];
    const weightSum = Object.values(customWeights).join(" + ");

    const weightedDiffs = scaleColumns
        .map((scale) => {
            const weight = customWeights[scale];
            return `${weight} * POWER(${brandWithScales[scale].name} - ${brand[scale]}, 2)`;
        })
        .join(' + ');

    const distanceExpr = sql.raw(`SQRT((${weightedDiffs}) / (${weightSum}))`).as("distance");
    const similarityExpr = sql.raw(`1 - (SQRT((${weightedDiffs}) / (${weightSum})) / 4)`).as("similarity");

    return db
        .select({
            ...getTableColumns(brandWithScales),
            distance: distanceExpr,
            similarity: similarityExpr,
        })
        .from(brands)
        .leftJoin(brandWithScales, eq(brands.id, brandWithScales.id))
        .where(ne(brandWithScales.id, brand.id))
        .orderBy(asc(sql`distance`))
        .limit(limit);
}
