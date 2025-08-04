import { and, count, eq, isNotNull } from 'drizzle-orm'
import { Database } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { db } from '@/db'
import { brandsStores, brands as brandsTable, contents as contentsTable } from '@/db/schema'

export const BrandsWidget = async ({ storeId }: { storeId: string }) => {
    const [brands, [totalBrands]] = await Promise.all([
        db
            .select()
            .from(brandsStores)
            .innerJoin(contentsTable, eq(brandsStores.integrationId, contentsTable.entityId))
            .where(
                and(
                    eq(contentsTable.entityType, 'brand'),
                    eq(brandsStores.storeId, storeId),
                    isNotNull(brandsStores.integrationId)
                )
            ),

        db.select({ count: count() }).from(brandsStores),
    ])

    const missingContentCount = totalBrands.count - brands.length

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Brands</CardTitle>
                <Database className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalBrands.count}</div>
                <div className="mt-2 flex items-center">
                    <span className="text-destructive text-sm">{missingContentCount} has no content</span>
                    <Progress value={(missingContentCount / totalBrands.count) * 100} className="ml-3 h-2 flex-1" />
                </div>
            </CardContent>
        </Card>
    )
}
