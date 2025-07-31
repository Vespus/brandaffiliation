import React, { Suspense } from 'react'

import Link from 'next/link'

import { and, eq, or, sql } from 'drizzle-orm'
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Zap } from 'lucide-react'
import { BrandsWidget } from '@/app/dashboard/batch-studio/widgets/brands-widget'
import { CategoriesWidget } from '@/app/dashboard/batch-studio/widgets/categories-widget'
import { CombinationsWidget } from '@/app/dashboard/batch-studio/widgets/combinations-widget'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { db } from '@/db'
import { brands, categories, combinations, contents, tasks } from '@/db/schema'
import { cn } from '@/lib/utils'

export default async function Page() {
    const [awaitingTasks, awaitingReviews] = await Promise.all([
        db
            .select({
                task: tasks,
                entityName: sql`COALESCE(
                ${brands.name},
                ${categories.name},
                ${combinations.name}
                )`.as('entityName'),
                brand: brands,
                category: categories,
                combination: combinations,
            })
            .from(tasks)
            .leftJoin(
                combinations,
                and(eq(tasks.entityType, 'combination'), eq(tasks.entityId, combinations.integrationId))
            )
            .leftJoin(
                categories,
                and(
                    or(eq(tasks.entityType, 'combination'), eq(tasks.entityType, 'category')),
                    or(
                        eq(tasks.entityId, categories.integrationId),
                        eq(categories.integrationId, combinations.categoryId)
                    )
                )
            )
            .leftJoin(
                brands,
                and(or(eq(tasks.entityId, brands.integrationId), eq(brands.integrationId, combinations.brandId)))
            ),
        db
            .select({
                content: contents,
                entityName: sql`COALESCE
                (
                ${brands.name},
                ${categories.name},
                ${combinations.name}
                )`.as('entityName'),
                brand: brands,
                category: categories,
                combination: combinations,
            })
            .from(contents)
            .where(eq(contents.needsReview, true) /*isNull(contents.needsReview)*/)
            .leftJoin(
                combinations,
                and(eq(contents.entityType, 'combination'), eq(contents.entityId, combinations.integrationId))
            )
            .leftJoin(
                categories,
                and(
                    or(eq(contents.entityType, 'combination'), eq(contents.entityType, 'category')),
                    or(
                        eq(contents.entityId, categories.integrationId),
                        eq(categories.integrationId, combinations.categoryId)
                    )
                )
            )
            .leftJoin(
                brands,
                and(or(eq(contents.entityId, brands.integrationId), eq(contents.entityId, combinations.brandId)))
            ),
    ])

    return (
        <div className="mx-auto h-full min-h-0 w-7xl max-w-full flex-1 justify-center p-6">
            <div className="mb-4 grid grid-cols-3 gap-4">
                <Suspense fallback={<WidgetSkeletons />}>
                    <BrandsWidget />
                    <CategoriesWidget />
                    <CombinationsWidget />
                </Suspense>
            </div>

            <Tabs defaultValue="tasks" className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList className="grid w-fit grid-cols-2">
                        <TabsTrigger value="tasks" className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Pending Tasks</span>
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Awaiting Review</span>
                        </TabsTrigger>
                    </TabsList>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Zap className="mr-2 h-4 w-4" />
                                Generate Content
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuGroup>
                                <Link href="/dashboard/batch-studio/brands">
                                    <DropdownMenuItem>Brand Content</DropdownMenuItem>
                                </Link>
                                <Link href="/dashboard/batch-studio/categories">
                                    <DropdownMenuItem>Category Content</DropdownMenuItem>
                                </Link>
                                <Link href="/dashboard/batch-studio/combinations">
                                    <DropdownMenuItem>Combination Content</DropdownMenuItem>
                                </Link>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <TabsContent value="tasks">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <AlertCircle className="h-5 w-5 text-amber-500" />
                                <span>Processing Queue</span>
                            </CardTitle>
                            <CardDescription>
                                {awaitingTasks.length > 0 && (
                                    <p className="text-muted-foreground text-xs">
                                        You have currently {awaitingTasks.length} unprocessed tasks.
                                    </p>
                                )}
                            </CardDescription>
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
                                    {awaitingTasks.slice(0, 5).map((task) => (
                                        <TableRow key={task.task.id}>
                                            <TableCell>{task.task.id}</TableCell>
                                            <TableCell>{task.entityName as string}</TableCell>
                                            <TableCell>{task.task.entityType}</TableCell>
                                            <TableCell>{task.combination?.description || 'N/A'}</TableCell>
                                            <TableCell>{task.category?.description || 'N/A'}</TableCell>
                                            <TableCell>{task.brand?.name || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {awaitingTasks.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                No tasks to process right now.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <Link
                                className={cn(buttonVariants({ variant: 'outline' }))}
                                href="/dashboard/batch-studio/tasks"
                            >
                                Go to Tasks
                            </Link>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="reviews">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                <span>Ready for Review</span>
                            </CardTitle>
                            <CardDescription>
                                {awaitingReviews.length > 0 && (
                                    <p className="text-muted-foreground text-xs">
                                        {awaitingReviews.length} tasks are processed. They are waiting for approval to
                                        get integrated into QSPay.
                                    </p>
                                )}
                            </CardDescription>
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
                                    {awaitingReviews.slice(0, 5).map((task) => (
                                        <TableRow key={task.content.id}>
                                            <TableCell>{task.content.id}</TableCell>
                                            <TableCell>{task.entityName as string}</TableCell>
                                            <TableCell>{task.content.entityType}</TableCell>
                                            <TableCell>{task.combination?.description || 'N/A'}</TableCell>
                                            <TableCell>{task.category?.description || 'N/A'}</TableCell>
                                            <TableCell>{task.brand?.name || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {awaitingReviews.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                No contents awaiting for review
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <Link
                                className={cn(buttonVariants({ variant: 'outline' }))}
                                href="/dashboard/batch-studio/review"
                            >
                                Go to Reviews
                            </Link>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

const WidgetSkeletons = () => {
    return (
        <>
            <Card>
                <CardContent>
                    <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-full max-w-full"></Skeleton>
                        <Skeleton className="h-4 w-1/12 max-w-full"></Skeleton>
                        <Skeleton className="h-4 w-2/12 max-w-full"></Skeleton>
                        <Skeleton className="h-4 w-5/12 max-w-full"></Skeleton>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-full max-w-full"></Skeleton>
                        <Skeleton className="h-4 w-4/12 max-w-full"></Skeleton>
                        <Skeleton className="h-4 w-7/12 max-w-full"></Skeleton>
                        <Skeleton className="h-4 w-2/12 max-w-full"></Skeleton>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-full max-w-full"></Skeleton>
                        <Skeleton className="h-4 w-2/12 max-w-full"></Skeleton>
                        <Skeleton className="h-4 w-10/12 max-w-full"></Skeleton>
                        <Skeleton className="h-4 w-4/12 max-w-full"></Skeleton>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
