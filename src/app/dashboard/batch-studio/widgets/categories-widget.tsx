import { db } from "@/db";
import { categories as categoriesTable, contents as contentsTable } from "@/db/schema";
import { and, count, eq, isNotNull } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayersIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const CategoriesWidget = async () => {
    const [categories, [totalCategories]] = await Promise.all([
        db.select()
            .from(categoriesTable)
            .innerJoin(contentsTable, eq(categoriesTable.integrationId, contentsTable.entityId))
            .where(and(eq(contentsTable.entityType, "category"), isNotNull(categoriesTable.integrationId))),
        db.select({count: count()})
            .from(categoriesTable)
            .where(isNotNull(categoriesTable.integrationId))
    ])

    const missingContentCount = totalCategories.count - categories.length

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium ">Categories</CardTitle>
                <LayersIcon className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold ">{totalCategories.count}</div>
                <div className="flex items-center mt-2">
                    <span className="text-sm text-destructive">{missingContentCount} has no content</span>
                    <Progress value={(missingContentCount / totalCategories.count) * 100} className="ml-3 flex-1 h-2"/>
                </div>
            </CardContent>
        </Card>
    )
}