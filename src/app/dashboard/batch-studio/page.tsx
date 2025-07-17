import { BrandsWidget } from "@/app/dashboard/batch-studio/widgets/brands-widget";
import { CategoriesWidget } from "@/app/dashboard/batch-studio/widgets/categories-widget";
import { CombinationsWidget } from "@/app/dashboard/batch-studio/widgets/combinations-widget";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/db";
import { brands, categories, combinations, contents, tasks } from "@/db/schema";
import { cn } from "@/lib/utils";
import { and, eq, or, sql } from "drizzle-orm";
import Link from "next/link";
import React from "react";

export default async function Page() {
    const [awaitingTasks, awaitingReviews] = await Promise.all([
        db.select({
            task: tasks,
            entityName: sql`COALESCE(${brands.name},${categories.name},${combinations.name})`.as("entityName"),
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
                ( ${brands.name},
                    ${categories.name},
                    ${combinations.name})`.as("entityName"),
                brand: brands,
                category: categories,
                combination: combinations
            })
            .from(contents)
            .where(eq(contents.needsReview, null))
            .leftJoin(combinations, and(eq(contents.entityType, "combination"), eq(contents.entityId, combinations.integrationId)))
            .leftJoin(categories, and(or(eq(contents.entityType, "combination"), eq(contents.entityType, "category")), or(eq(contents.entityId, categories.integrationId), eq(categories.integrationId, combinations.categoryId))))
            .leftJoin(brands, and(or(eq(contents.entityId, brands.integrationId), eq(contents.entityId, combinations.brandId))))
    ])

    return (
        <div className="h-full flex-1 min-h-0">
            <div className="flex flex-none flex-col min-h-0 flex-wrap gap-4 pb-6 xl:flex-row xl:gap-0 border-b">
                <BrandsWidget/>
                <div
                    className="relative w-0 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-muted hidden xl:block"></div>
                <CategoriesWidget/>
                <div
                    className="relative w-0 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-muted hidden xl:block"></div>
                <CombinationsWidget/>
            </div>
            <div className="prose prose-sm dark:prose-inverse">
                {awaitingTasks.length > 0 && <p>You have currently {awaitingTasks.length} unprocessed tasks. <Link
                    href="/dashboard/batch-studio/tasks">Click Here</Link> to check them!</p>}
                {awaitingReviews.length > 0 &&
                    <p>{awaitingReviews.length} tasks are processed. They are waiting for approval to get integrated
                        into QSPay.</p>}
            </div>
            <div className="flex gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Awaiting Tasks</CardTitle>
                        <CardDescription>Top 5 tasks that waits to get processed</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                        <TableCell>{task.entityName}</TableCell>
                                        <TableCell>{task.task.entityType}</TableCell>
                                        <TableCell>{task.combination?.description || "N/A"}</TableCell>
                                        <TableCell>{task.category?.description || "N/A"}</TableCell>
                                        <TableCell>{task.brand?.name || "N/A"}</TableCell>
                                    </TableRow>
                                ))}
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
                        <CardTitle>Awaiting Tasks</CardTitle>
                        <CardDescription>Top 5 tasks that waits to get processed</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                        <TableCell>{task.entityName}</TableCell>
                                        <TableCell>{task.task.entityType}</TableCell>
                                        <TableCell>{task.combination?.description || "N/A"}</TableCell>
                                        <TableCell>{task.category?.description || "N/A"}</TableCell>
                                        <TableCell>{task.brand?.name || "N/A"}</TableCell>
                                    </TableRow>
                                ))}
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
            </div>
        </div>
    )
}