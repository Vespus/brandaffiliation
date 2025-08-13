import { and, count, eq, or, sql } from 'drizzle-orm'
import { CheckIcon, XIcon, ZapIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { db } from '@/db'
import { combinations as combinationsTable, contents } from '@/db/schema'
import { cn } from '@/lib/utils'

export const CombinationsWidget = async ({ storeId }: { storeId: string }) => {
    const [totalContent, totalCombinations, incompleteContents] = await Promise.all([
        db
            .select({ count: count() })
            .from(contents)
            .where(and(eq(contents.entityType, 'combination'), eq(contents.storeId, storeId)))
            .execute()
            .then((res) => res[0].count ?? 0),
        db
            .select({ count: count() })
            .from(combinationsTable)
            .where(eq(combinationsTable.storeId, storeId))
            .execute()
            .then((res) => res[0].count ?? 0),
        db
            .select({ count: count() })
            .from(combinationsTable)
            .leftJoin(
                contents,
                and(
                    eq(contents.entityId, combinationsTable.integrationId),
                    eq(contents.entityType, 'combination'),
                    eq(contents.storeId, storeId)
                )
            )
            .where(
                and(
                    eq(combinationsTable.storeId, storeId),
                    or(
                        sql`${contents.config}->'descriptions'->>'header' IS NULL`,
                        sql`${contents.config}->'descriptions'->>'header' = ''`,
                        sql`${contents.config}->'descriptions'->>'footer' IS NULL`,
                        sql`${contents.config}->'descriptions'->>'footer' = ''`
                    )
                )
            )
            .execute()
            .then((res) => res[0].count ?? 0),
    ])

    const missingContentCount = totalCombinations - totalContent
    const missingIncompleteContentCount = totalCombinations - (totalContent - incompleteContents)

    return (
        <Card className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Combinations</CardTitle>
                <ZapIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="mb-4 text-2xl font-bold">
                    {totalCombinations} <span className="text-muted-foreground text-sm font-normal">Records</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted flex flex-1 flex-col items-stretch rounded-lg p-2">
                        <span className="text-muted-foreground mb-1 line-clamp-2 h-10 min-w-0 text-xs text-pretty">
                            {missingContentCount > 0 ? (
                                <span className="flex space-x-1">
                                    <XIcon className="size-4" />
                                    <span>{missingContentCount} page has no content</span>
                                </span>
                            ) : (
                                <span className="flex space-x-1">
                                    <CheckIcon className="size-4" />
                                    <span>All pages have content</span>
                                </span>
                            )}
                        </span>
                        <Progress
                            value={(totalContent / totalCombinations) * 100}
                            className="h-2 flex-none"
                            indicatorClassName={cn(missingContentCount > 0 ? 'bg-amber-500' : 'bg-green-500')}
                        />
                    </div>
                    <div className="bg-muted flex flex-1 flex-col items-stretch rounded-lg p-2">
                        <span className="text-muted-foreground mb-1 line-clamp-2 h-10 min-w-0 text-xs text-pretty">
                            {missingIncompleteContentCount > 0 ? (
                                <span className="flex space-x-1">
                                    <XIcon className="size-4" />
                                    <span>{missingIncompleteContentCount} page have missing content</span>
                                </span>
                            ) : (
                                <span className="flex space-x-1">
                                    <CheckIcon className="size-4" />
                                    <span>All pages have content</span>
                                </span>
                            )}
                        </span>
                        <Progress
                            value={((totalContent - incompleteContents) / totalCombinations) * 100}
                            className="h-2 flex-none"
                            indicatorClassName={cn(missingIncompleteContentCount > 0 ? 'bg-amber-500' : 'bg-green-500')}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
