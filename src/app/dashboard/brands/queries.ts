import { and, asc, count, desc, gte, ilike, lte } from 'drizzle-orm'
import { createSearchParamsCache, parseAsArrayOf, parseAsInteger, parseAsString } from 'nuqs/server'
import { z } from 'zod'
import { db } from '@/db'
import { brandWithScales } from '@/db/schema'
import { BrandWithCharacteristicAndScales } from '@/db/types'
import { getSortingStateParser } from '@/lib/datatable/parsers'

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<BrandWithCharacteristicAndScales>().withDefault([{ id: 'name', desc: false }]),
    name: parseAsString.withDefault(''),
    price: parseAsArrayOf(z.coerce.number()).withDefault([]),
    quality: parseAsArrayOf(z.coerce.number()).withDefault([]),
    focus: parseAsArrayOf(z.coerce.number()).withDefault([]),
    positioning: parseAsArrayOf(z.coerce.number()).withDefault([]),
    heritage: parseAsArrayOf(z.coerce.number()).withDefault([]),
    origin: parseAsArrayOf(z.coerce.number()).withDefault([]),
    recognition: parseAsArrayOf(z.coerce.number()).withDefault([]),
    revenue: parseAsArrayOf(z.coerce.number()).withDefault([]),
})

export const getBrands = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
    const offset = (input.page - 1) * input.perPage

    const where = and(
        input.name ? ilike(brandWithScales.name, `%${input.name}%`) : undefined,
        input.price.length > 0
            ? and(
                  input.price[0] ? gte(brandWithScales.price, input.price[0]) : undefined,
                  input.price[1] ? lte(brandWithScales.price, input.price[1]) : undefined
              )
            : undefined,
        input.quality.length > 0
            ? and(
                  input.quality[0] ? gte(brandWithScales.quality, input.quality[0]) : undefined,
                  input.quality[1] ? lte(brandWithScales.quality, input.quality[1]) : undefined
              )
            : undefined,
        input.focus.length > 0
            ? and(
                  input.focus[0] ? gte(brandWithScales.focus, input.focus[0]) : undefined,
                  input.focus[1] ? lte(brandWithScales.focus, input.focus[1]) : undefined
              )
            : undefined,
        input.positioning.length > 0
            ? and(
                  input.positioning[0] ? gte(brandWithScales.positioning, input.positioning[0]) : undefined,
                  input.positioning[1] ? lte(brandWithScales.positioning, input.positioning[1]) : undefined
              )
            : undefined,
        input.heritage.length > 0
            ? and(
                  input.heritage[0] ? gte(brandWithScales.heritage, input.heritage[0]) : undefined,
                  input.heritage[1] ? lte(brandWithScales.heritage, input.heritage[1]) : undefined
              )
            : undefined,
        input.origin.length > 0
            ? and(
                  input.origin[0] ? gte(brandWithScales.origin, input.origin[0]) : undefined,
                  input.origin[1] ? lte(brandWithScales.origin, input.origin[1]) : undefined
              )
            : undefined,
        input.recognition.length > 0
            ? and(
                  input.recognition[0] ? gte(brandWithScales.recognition, input.recognition[0]) : undefined,
                  input.recognition[1] ? lte(brandWithScales.recognition, input.recognition[1]) : undefined
              )
            : undefined,
        input.revenue.length > 0
            ? and(
                  input.revenue[0] ? gte(brandWithScales.revenue, input.revenue[0]) : undefined,
                  input.revenue[1] ? lte(brandWithScales.revenue, input.revenue[1]) : undefined
              )
            : undefined
    )

    const orderBy =
        input.sort.length > 0
            ? input.sort.map((item) => (item.desc ? desc(brandWithScales[item.id]) : asc(brandWithScales[item.id])))
            : [asc(brandWithScales.name)]

    const { data, total } = await db.transaction(async (tx) => {
        const scaleList = await tx.query.scales.findMany()

        const data = await tx
            .select()
            .from(brandWithScales)
            .where(where)
            .orderBy(...orderBy)
            .offset(offset)
            .limit(input.perPage)

        const total = await tx
            .select({
                count: count(),
            })
            .from(brandWithScales)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0)

        return {
            data: {
                brands: data,
                scaleList,
            },
            total,
        }
    })

    const pageCount = Math.ceil(total / input.perPage)
    return { data, pageCount }
}
