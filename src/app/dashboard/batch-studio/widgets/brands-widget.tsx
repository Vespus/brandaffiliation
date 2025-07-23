import {db} from "@/db";
import {brands as brandsTable, contents as contentsTable} from "@/db/schema";
import {count, eq} from "drizzle-orm";
import {cn} from "@/lib/utils";
import Link from "next/link";
import {buttonVariants} from "@/components/ui/button";

export const BrandsWidget = async () => {
    const [brands, [totalBrands]] = await Promise.all([
        db.select()
            .from(brandsTable)
            .innerJoin(contentsTable, eq(brandsTable.integrationId, contentsTable.entityId))
            .where(eq(contentsTable.entityType, "brand")),
        db.select({count: count()}).from(brandsTable)
    ])

    const missingContentCount = totalBrands.count - brands.length

    return (
        <div className="w-full sm:w-1/2 sm:px-7 xl:w-1/4 bg-amber-50 dark:bg-muted p-4 rounded-lg">
            <div className="text-muted-foreground text-sm">Brands</div>
            <div className="mt-1 flex flex-col gap-1.5">
                <div className="text-lg font-semibold">{totalBrands.count} records</div>
                <div className="text-xs text-muted-foreground">
                    <span className={cn("text-amber-500", !missingContentCount && "text-green-500")}>{missingContentCount}</span> has missing contents
                </div>
            </div>
            <div className="mt-4">
                <Link className={buttonVariants()} href="/dashboard/batch-studio/brands">Generate Brand Contents</Link>
            </div>
        </div>
    )
}