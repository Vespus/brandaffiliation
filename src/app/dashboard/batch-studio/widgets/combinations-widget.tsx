import { and, count, eq, isNotNull } from 'drizzle-orm'
import { ZapIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { db } from '@/db'
import { combinations as combinationsTable, contents as contentsTable } from '@/db/schema'

export const CombinationsWidget = async () => {
    const [combinations, [totalCombinations]] = await Promise.all([
        db
            .select()
            .from(combinationsTable)
            .innerJoin(contentsTable, eq(combinationsTable.integrationId, contentsTable.entityId))
            .where(and(eq(contentsTable.entityType, 'combination'), isNotNull(combinationsTable.integrationId))),
        db.select({ count: count() }).from(combinationsTable).where(isNotNull(combinationsTable.integrationId)),
    ])

    const missingContentCount = totalCombinations.count - combinations.length

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Combinations</CardTitle>
                <ZapIcon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalCombinations.count}</div>
                <div className="mt-2 flex items-center">
                    <span className="text-destructive text-sm">{missingContentCount} has no content</span>
                    <Progress
                        value={(missingContentCount / totalCombinations.count) * 100}
                        className="ml-3 h-2 flex-1"
                    />
                </div>
            </CardContent>
        </Card>
    )
}
