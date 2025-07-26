import { db } from "@/db";
import { brands as brandsTable, contents as contentsTable } from "@/db/schema";
import { and, count, eq, isNotNull } from "drizzle-orm";
import { Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const BrandsWidget = async () => {
    const [brands, [totalBrands]] = await Promise.all([
        db.select()
            .from(brandsTable)
            .innerJoin(contentsTable, eq(brandsTable.integrationId, contentsTable.entityId))
            .where(and(eq(contentsTable.entityType, "brand"), isNotNull(brandsTable.integrationId))),

        db.select({count: count()}).from(brandsTable).where(isNotNull(brandsTable.integrationId))
    ])

    const missingContentCount = totalBrands.count - brands.length

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium ">Brands</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold ">{totalBrands.count}</div>
                <div className="flex items-center mt-2">
                    <span className="text-sm text-destructive">{missingContentCount} has no content</span>
                    <Progress value={(missingContentCount / totalBrands.count) * 100} className="ml-3 flex-1 h-2"/>
                </div>
            </CardContent>
        </Card>
    )
}