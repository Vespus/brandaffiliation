import {db} from "@/db";
import {brands, categories, combinations, tasks} from "@/db/schema";
import {and, eq, sql} from "drizzle-orm";
import {Table, TableBody, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Entity} from "@/app/dashboard/batch-studio/tasks/entity";
import {TaskJoin} from "@/app/dashboard/batch-studio/tasks/type";
import {alias} from "drizzle-orm/pg-core";

export default async function Tasks() {
    const combinationBrand = alias(brands, "combinationBrand");
    const combinationCategory = alias(categories, "combinationCategory");

    const tasksResult = await db
        .select({
            task: tasks,
            entityName: sql`COALESCE(brands.name, categories.name, combinations.name)`.as("entityName"),
            brand: combinationBrand,
            category: combinationCategory,
        })
        .from(tasks)
        .leftJoin(brands, and(eq(tasks.entityType, "brand"), eq(tasks.entityId, brands.integrationId)))
        .leftJoin(categories, and(eq(tasks.entityType, "category"), eq(tasks.entityId, categories.integrationId)))
        .leftJoin(combinations, and(eq(tasks.entityType, "combination"), eq(tasks.entityId, combinations.integrationId)))
        .leftJoin(combinationBrand, eq(combinations.brandId, combinationBrand.integrationId))
        .leftJoin(combinationCategory, eq(combinations.categoryId, combinationCategory.integrationId))


    console.log(tasksResult.find(t => t.task.entityType === "combination"))

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Invoice</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        tasksResult.map(result => (
                            <Entity key={result.tasks.entityType + result.tasks.entityId} task={result} />
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}