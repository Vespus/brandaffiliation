import {db} from "@/db";
import {categories as categoriesTable, contents as contentsTable} from "@/db/schema";
import {count, eq} from "drizzle-orm";
import {cn} from "@/lib/utils";

export const CategoriesWidget = async () => {
    const [categories, [totalCategories]] = await Promise.all([
        db.select()
            .from(categoriesTable)
            .innerJoin(contentsTable, eq(categoriesTable.integrationId, contentsTable.entityId))
            .where(eq(contentsTable.entityType, "category")),
        db.select({count: count()}).from(categoriesTable)
    ])

    const missingContentCount = totalCategories.count - categories.length

    return (
        <div className="w-full pb-4 first:pl-0 last:pr-0 sm:w-1/2 sm:px-7 sm:pb-0 xl:w-1/4 xl:pb-0">
            <div className="text-muted-foreground text-sm">Categories</div>
            <div className="mt-1 flex flex-col gap-1.5">
                <div className="text-lg font-semibold">{totalCategories.count} records</div>
                <div className="text-xs text-muted-foreground">
                    <span className={cn("text-amber-500", !missingContentCount && "text-green-500")}>{missingContentCount}</span> has missing contents
                </div>
            </div>
        </div>
    )
}