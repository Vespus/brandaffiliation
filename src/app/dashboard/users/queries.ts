import { db } from "@/db";
import { users, } from "@/db/schema";
import { getSortingStateParser } from "@/lib/datatable/parsers";
import { User } from "better-auth";
import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { createSearchParamsCache, parseAsInteger, parseAsString, parseAsBoolean } from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<User>().withDefault([
        {id: "name", desc: false},
    ]),
    name: parseAsString.withDefault(""),
    email: parseAsString.withDefault(""),
    banned: parseAsBoolean.withDefault(false),
});

export const getUsers = async (input: Awaited<ReturnType<typeof searchParamsCache.parse>>) => {
    const offset = (input.page - 1) * input.perPage;

    const where = and(
        input.name ? ilike(users.name, `%${input.name}%`) : undefined,
        input.email ? ilike(users.email, `%${input.email}%`) : undefined,
        input.banned ? eq(users.banned, input.banned) : undefined
    )

    const orderBy =
        input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc ? desc(users[item.id]) : asc(users[item.id]),
            )
            : [asc(users.name)];


    const {data, total} = await db.transaction(async (tx) => {
        const data = await tx.select()
            .from(users)
            .where(where)
            .orderBy(...orderBy)
            .offset(offset)
            .limit(input.perPage)

        const total = await tx
            .select({
                count: count(),
            })
            .from(users)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0);

        return {
            data: {
                users: data,
            },
            total,
        }
    })

    const pageCount = Math.ceil(total / input.perPage);
    return {data, pageCount};
}