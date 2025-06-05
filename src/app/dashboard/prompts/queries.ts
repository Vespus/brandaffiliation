import { db } from '@/db';
import { systemPrompts } from '@/db/schema';
import { and, count, desc, ilike, type SQL } from 'drizzle-orm';
import { createSearchParamsCache, parseAsInteger, parseAsString } from 'nuqs/server';

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    size: parseAsInteger.withDefault(10),
    name: parseAsString.withDefault(''),
    sort: parseAsString.withDefault(''),
    order: parseAsString.withDefault('asc'),
});

export async function getPrompts(input: Awaited<ReturnType<typeof searchParamsCache.parse>>) {
    const {page, size, name, sort, order} = input;

    const offset = (page - 1) * size;
    const where: SQL[] = [];

    if (name) {
        where.push(ilike(systemPrompts.name, `%${name}%`));
    }

    const whereClause = where.length > 0 ? and(...where) : undefined;

    const [data, total] = await Promise.all([
        db
            .select({
                id: systemPrompts.id,
                name: systemPrompts.name,
                description: systemPrompts.description,
                createdAt: systemPrompts.createdAt,
                updatedAt: systemPrompts.updatedAt,
            })
            .from(systemPrompts)
            .where(whereClause)
            .limit(size)
            .offset(offset)
            .orderBy(
                sort === 'name'
                    ? order === 'desc'
                        ? desc(systemPrompts.name)
                        : systemPrompts.name
                    : sort === 'createdAt'
                        ? order === 'desc'
                            ? desc(systemPrompts.createdAt)
                            : systemPrompts.createdAt
                        : systemPrompts.name
            ),
        db
            .select({count: count()})
            .from(systemPrompts)
            .where(whereClause)
            .then((res) => res[0]?.count ?? 0),
    ]);

    const pageCount = Math.ceil(total / size);

    return {
        data: {prompts: data, total},
        pageCount,
    };
}

export const getPromptById = (id: number) =>
    db.query.systemPrompts.findFirst({where: (tbl, {eq}) => eq(tbl.id, id)});