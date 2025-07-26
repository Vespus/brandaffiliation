import { db } from "@/db";
import { combinations as combinationsTable, contents as contentsTable } from "@/db/schema";
import { and, count, eq, isNotNull } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ZapIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const CombinationsWidget = async () => {
    const [combinations, [totalCombinations]] = await Promise.all([
        db.select()
            .from(combinationsTable)
            .innerJoin(contentsTable, eq(combinationsTable.integrationId, contentsTable.entityId))
            .where(and(eq(contentsTable.entityType, "combination"), isNotNull(combinationsTable.integrationId))),
        db.select({count: count()})
            .from(combinationsTable)
            .where(isNotNull(combinationsTable.integrationId))
    ])

    const missingContentCount = totalCombinations.count - combinations.length

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium ">Combinations</CardTitle>
                <ZapIcon className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold ">{totalCombinations.count}</div>
                <div className="flex items-center mt-2">
                    <span className="text-sm text-destructive">{missingContentCount} has no content</span>
                    <Progress value={(missingContentCount / totalCombinations.count) * 100}
                              className="ml-3 flex-1 h-2"/>
                </div>
            </CardContent>
        </Card>
    )
}