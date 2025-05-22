import { db } from "@/db";
import { desc, eq, getTableColumns, ne, sql } from 'drizzle-orm';
import { brandWithScales, brands } from '@/db/schema';
import { searchParamsCache } from "@/app/dashboard/brands/[brand]/search-params";
import { BrandWithCharacteristicAndScales } from "@/db/types";

/**
 * Finds most similar brands to a target brand by its name using weighted scales.
 */
export async function findSimilarityByScale(
    brand: BrandWithCharacteristicAndScales,
    input: Awaited<ReturnType<typeof searchParamsCache.parse>>,
    limit = 6
) {
    // @formatter:off
    const distanceExpr = sql<number>`SQRT((
        ${input.price}::float * POWER(${brandWithScales.price} - ${brand.price}, 2) +
        ${input.quality}::float * POWER(${brandWithScales.quality} - ${brand.quality}, 2) +
        ${input.focus}::float * POWER(${brandWithScales.focus} - ${brand.focus}, 2) +
        ${input.design}::float * POWER(${brandWithScales.design} - ${brand.design}, 2) +
        ${input.positioning}::float * POWER(${brandWithScales.positioning} - ${brand.positioning}, 2) +
        ${input.heritage}::float * POWER(${brandWithScales.heritage} - ${brand.heritage}, 2) +
        ${input.origin}::float * POWER(${brandWithScales.origin} - ${brand.origin}, 2) +
        ${input.recognition}::float * POWER(${brandWithScales.recognition} - ${brand.recognition}, 2) +
        ${input.revenue}::float * POWER(${brandWithScales.revenue} - ${brand.revenue}, 2)
    ) / 1)`
    const similarity = sql<number>`1 - (${distanceExpr} / 4)`.as("similarity")
    // @formatter:on

    const characteristicValues = sql<string>`jsonb_array_elements(${brandWithScales.characteristic}) as agg_column`;

    const target = db.$with("target").as(
        db
            .select({
                brand_id: brandWithScales.id,
                vector: sql<string>`websearch_to_tsquery('german', string_agg(agg_column ->> 'value', ' ')::text)`.as("target_vector")
            })
            .from(brandWithScales)
            .crossJoinLateral(characteristicValues)
            .where(eq(brandWithScales.id, brand.id))
            .groupBy(brandWithScales.id)
    )
    const otherTargets = db.$with("other_targets").as(
        db
            .select({
                brand_id: brandWithScales.id,
                vector: sql<string>`to_tsvector('german', string_agg(agg_column ->> 'value', ' ')::text)`.as("others_vector")
            })
            .from(brandWithScales)
            .crossJoinLateral(characteristicValues)
            .where(ne(brandWithScales.id, brand.id))
            .groupBy(brandWithScales.id)
    )
    const scale_similarity = db.$with("scale_similarity").as(
        db
            .select({
                brand_id: brandWithScales.id,
                scale_similarity: similarity
            })
            .from(brandWithScales)
            .where(ne(brandWithScales.id, brand.id))
    )
    const with_text_similarity = db.$with("text_similarity").as(
        db
            .select({
                brand_id: scale_similarity.brand_id,
                scale_similarity: scale_similarity.scale_similarity,
                query: target.vector,
                against: otherTargets.vector,
                text_similarity: sql<number>`ts_rank(${otherTargets.vector}, ${target.vector})`.as("text_similarity")
            })
            .from(scale_similarity)
            .innerJoin(otherTargets, eq(scale_similarity.brand_id, otherTargets.brand_id))
            .crossJoin(target)
    )

    const combined_similarity = sql<number>`((${with_text_similarity.scale_similarity} * ${input.similarityWeight[0]}) + (${with_text_similarity.text_similarity} * ${input.similarityWeight[1]}))`.as("combined_similarity")

    return db
        .with(target, otherTargets, scale_similarity, with_text_similarity)
        .select({
            ...getTableColumns(brandWithScales),
            query: with_text_similarity.query,
            against: with_text_similarity.against,
            scale_similarity: with_text_similarity.scale_similarity,
            text_similarity: with_text_similarity.text_similarity,
            combined_similarity: combined_similarity
        })
        .from(brands)
        .innerJoin(brandWithScales, eq(brands.id, brandWithScales.id))
        .innerJoin(with_text_similarity, eq(with_text_similarity.brand_id, brandWithScales.id))
        .where(ne(brandWithScales.id, brand.id))
        .orderBy(desc(combined_similarity))
        .limit(limit);
}
