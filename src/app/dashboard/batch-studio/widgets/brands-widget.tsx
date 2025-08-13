import { and, count, eq, or, sql } from 'drizzle-orm'
import { CheckIcon, Database, XIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { db } from '@/db'
import { brandsStores, contents } from '@/db/schema'
import { cn } from '@/lib/utils'

export const BrandsWidget = async ({ storeId }: { storeId: string }) => {
    const [totalContent, totalBrands, incompleteContents] = await Promise.all([
        db
            .select({ count: count() })
            .from(contents)
            .where(and(eq(contents.entityType, 'brand'), eq(contents.storeId, storeId)))
            .execute()
            .then((res) => res[0].count ?? 0),
        db
            .select({ count: count() })
            .from(brandsStores)
            .where(eq(brandsStores.storeId, storeId))
            .execute()
            .then((res) => res[0].count ?? 0),
        db
            .select({ count: count() })
            .from(brandsStores)
            .leftJoin(
                contents,
                and(
                    eq(contents.entityId, brandsStores.integrationId),
                    eq(contents.entityType, 'brand'),
                    eq(contents.storeId, storeId)
                )
            )
            .where(
                and(
                    eq(brandsStores.storeId, storeId),
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

    const missingContentCount = totalBrands - totalContent
    const missingIncompleteContentCount = totalBrands - (totalContent - incompleteContents)

    return (
        <Card className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Brands</CardTitle>
                <Database className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="mb-4 text-2xl font-bold">
                    {totalBrands} <span className="text-muted-foreground text-sm font-normal">Records</span>
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
                            value={(totalContent / totalBrands) * 100}
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
                            value={((totalContent - incompleteContents) / totalBrands) * 100}
                            className="h-2 flex-none"
                            indicatorClassName={cn(missingIncompleteContentCount > 0 ? 'bg-amber-500' : 'bg-green-500')}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
