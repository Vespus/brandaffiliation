import {BrandsWidget} from "@/app/dashboard/batch-studio/widgets/brands-widget";
import {CategoriesWidget} from "@/app/dashboard/batch-studio/widgets/categories-widget";
import {CombinationsWidget} from "@/app/dashboard/batch-studio/widgets/combinations-widget";
import {buttonVariants} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {db} from "@/db";
import {brands, categories, combinations, contents, tasks} from "@/db/schema";
import {cn} from "@/lib/utils";
import {and, eq, or, sql} from "drizzle-orm";
import Link from "next/link";
import React from "react";

export default async function Page() {
    const [awaitingTasks, awaitingReviews] = await Promise.all([
        db
            .select({
                task: tasks,
                entityName: sql`COALESCE(
                ${brands.name},
                ${categories.name},
                ${combinations.name}
                )`.as("entityName"),
                brand: brands,
                category: categories,
                combination: combinations
            })
            .from(tasks)
            .leftJoin(combinations, and(eq(tasks.entityType, "combination"), eq(tasks.entityId, combinations.integrationId)))
            .leftJoin(categories, and(or(eq(tasks.entityType, "combination"), eq(tasks.entityType, "category")), or(eq(tasks.entityId, categories.integrationId), eq(categories.integrationId, combinations.categoryId))))
            .leftJoin(brands, and(or(eq(tasks.entityId, brands.integrationId), eq(brands.integrationId, combinations.brandId)))),
        db
            .select({
                content: contents,
                entityName: sql`COALESCE
                (
                ${brands.name},
                ${categories.name},
                ${combinations.name}
                )`.as("entityName"),
                brand: brands,
                category: categories,
                combination: combinations
            })
            .from(contents)
            .where(eq(contents.needsReview, true)/*isNull(contents.needsReview)*/)
            .leftJoin(combinations, and(eq(contents.entityType, "combination"), eq(contents.entityId, combinations.integrationId)))
            .leftJoin(categories, and(or(eq(contents.entityType, "combination"), eq(contents.entityType, "category")), or(eq(contents.entityId, categories.integrationId), eq(categories.integrationId, combinations.categoryId))))
            .leftJoin(brands, and(or(eq(contents.entityId, brands.integrationId), eq(contents.entityId, combinations.brandId))))
    ])

    return (
        <div className="h-full flex-1 min-h-0">
            <div className="flex flex-none flex-col min-h-0 flex-wrap gap-4 pb-6 xl:flex-row border-b">
                <BrandsWidget/>
                <CategoriesWidget/>
                <CombinationsWidget/>
            </div>
            <div className="flex gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Awaiting Tasks</CardTitle>
                        <CardDescription>Top 5 tasks that waits to get processed</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {awaitingTasks.length > 0 && <p className="text-xs text-muted-foreground">You have
                            currently {awaitingTasks.length} unprocessed tasks.</p>}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Identifier</TableHead>
                                    <TableHead>Task Name</TableHead>
                                    <TableHead>Task Type</TableHead>
                                    <TableHead>Combination Name</TableHead>
                                    <TableHead>Category Name</TableHead>
                                    <TableHead>Brand Name</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {awaitingTasks.slice(0, 5).map(task => (
                                    <TableRow key={task.task.id}>
                                        <TableCell>{task.task.id}</TableCell>
                                        <TableCell>{task.entityName as string}</TableCell>
                                        <TableCell>{task.task.entityType}</TableCell>
                                        <TableCell>{task.combination?.description || "N/A"}</TableCell>
                                        <TableCell>{task.category?.description || "N/A"}</TableCell>
                                        <TableCell>{task.brand?.name || "N/A"}</TableCell>
                                    </TableRow>
                                ))}
                                {
                                    awaitingTasks.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                No tasks to process right now.
                                            </TableCell>
                                        </TableRow>
                                    )
                                }
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Link
                            className={cn(buttonVariants())}
                            href="/dashboard/batch-studio/tasks"
                        >
                            Go to Tasks
                        </Link>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Awaiting Review</CardTitle>
                        <CardDescription>Top 5 generated contents awaiting for review</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {awaitingReviews.length > 0 &&
                            <p className="text-xs text-muted-foreground">{awaitingReviews.length} tasks are processed.
                                They are waiting for approval to get integrated
                                into QSPay.</p>}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Identifier</TableHead>
                                    <TableHead>Task Name</TableHead>
                                    <TableHead>Task Type</TableHead>
                                    <TableHead>Combination Name</TableHead>
                                    <TableHead>Category Name</TableHead>
                                    <TableHead>Brand Name</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {awaitingReviews.slice(0, 5).map(task => (
                                    <TableRow key={task.content.id}>
                                        <TableCell>{task.content.id}</TableCell>
                                        <TableCell>{task.entityName as string}</TableCell>
                                        <TableCell>{task.content.entityType}</TableCell>
                                        <TableCell>{task.combination?.description || "N/A"}</TableCell>
                                        <TableCell>{task.category?.description || "N/A"}</TableCell>
                                        <TableCell>{task.brand?.name || "N/A"}</TableCell>
                                    </TableRow>
                                ))}
                                {
                                    awaitingReviews.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                No contents awaiting for review
                                            </TableCell>
                                        </TableRow>
                                    )
                                }
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Link
                            className={cn(buttonVariants())}
                            href="/dashboard/batch-studio/review"
                        >
                            Go to Reviews
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}