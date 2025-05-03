import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsString,
} from "nuqs/server";
import { getSortingStateParser } from "@/lib/datatable/parsers";
import { Translation, translations } from "@/db/schema";
import { and, asc, count, desc, ilike } from "drizzle-orm";
import { db } from "@/db";

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<Translation>().withDefault([
        { id: "entityType", desc: false },
    ]),
    entityType: parseAsString.withDefault(""),
    entityId: parseAsString.withDefault(""),
    langCode: parseAsString.withDefault(""),
    textValue: parseAsString.withDefault(""),
});

export const getTranslations = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
    const offset = (input.page - 1) * input.perPage;

    const where = and(
        input.entityType ? ilike(translations.entityType, `%${input.entityType}%`) : undefined,
        input.entityId ? ilike(translations.entityId, `%${input.entityId}%`) : undefined,
        input.langCode ? ilike(translations.langCode, `%${input.langCode}%`) : undefined,
        input.textValue ? ilike(translations.textValue, `%${input.textValue}%`) : undefined,
    );

    const orderBy =
        input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc ? desc(translations[item.id as keyof typeof translations]) : asc(translations[item.id as keyof typeof translations]),
            )
            : [asc(translations.entityType), asc(translations.entityId), asc(translations.langCode)];

    const { data, total } = await db.transaction(async (tx) => {
        const data = await tx.query.translations.findMany({
            where,
            orderBy,
            offset,
            limit: input.perPage,
        });

        const total = await tx
            .select({
                count: count(),
            })
            .from(translations)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return {
            data,
            total,
        };
    });

    const pageCount = Math.ceil(total / input.perPage);
    return { data, pageCount };
};