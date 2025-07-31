import { AnyColumn, and, asc, count, desc, ilike } from 'drizzle-orm'
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server'
import { db } from '@/db'
import { datasources } from '@/db/schema'
import { Datasource } from '@/db/types'
import { getSortingStateParser } from '@/lib/datatable/parsers'

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<Datasource>().withDefault([{ id: 'name', desc: false }]),
    name: parseAsString.withDefault(''),
    description: parseAsString.withDefault(''),
})

export const getDatasources = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
    const offset = (input.page - 1) * input.perPage

    const where = and(
        input.name ? ilike(datasources.name, `%${input.name}%`) : undefined,
        input.description ? ilike(datasources.description || '', `%${input.description}%`) : undefined
    )

    const orderBy =
        input.sort.length > 0
            ? input.sort.map((item) =>
                  item.desc
                      ? desc(datasources[item.id as keyof typeof datasources] as AnyColumn)
                      : asc(datasources[item.id as keyof typeof datasources] as AnyColumn)
              )
            : [asc(datasources.name)]

    const { data, total } = await db.transaction(async (tx) => {
        const data = await tx.query.datasources.findMany({
            where,
            orderBy,
            offset,
            limit: input.perPage,
        })

        const total = await tx
            .select({
                count: count(),
            })
            .from(datasources)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0)

        return {
            data,
            total,
        }
    })

    const pageCount = Math.ceil(total / input.perPage)
    return { data, pageCount }
}

export const getDatasourceById = async (id: number) => {
    return db.query.datasources.findFirst({
        where: (datasources, { eq }) => eq(datasources.id, id),
    })
}
