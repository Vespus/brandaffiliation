'use client'

import * as React from 'react'
import { useEffect } from 'react'

import type { FieldPath, FieldValues } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { get } from 'es-toolkit/compat'
import { CheckIcon, FacebookIcon, Globe, NewspaperIcon, TwitterIcon } from 'lucide-react'
import { createPortal } from 'react-dom'
import { ControllerProps, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { SaveReviewTaskToQSPay } from '@/app/dashboard/batch-studio/actions'
import { ReviewJoin } from '@/app/dashboard/batch-studio/tasks/type'
import { MetaOutput, PartialMetaOutput, PartialMetaOutputSchema } from '@/app/dashboard/content-generation/types'
import { TipTapEditor } from '@/components/tiptap/editor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCustomAction } from '@/hooks/use-custom-action'

export const ReviewForm = ({ item }: { item: ReviewJoin }) => {
    const [domReady, setDomReady] = React.useState(false)
    const form = useForm<PartialMetaOutput>({
        resolver: zodResolver(PartialMetaOutputSchema),
        defaultValues: {
            meta: {
                title: item.content.config?.meta?.title || '',
                description: item.content.config?.meta?.description || '',
                category: item.content.config?.meta?.category || '',
                openGraph: {
                    type: item.content.config?.meta?.openGraph?.type || '',
                    title: item.content.config?.meta?.openGraph?.title || '',
                    description: item.content.config?.meta?.openGraph?.description || '',
                    locale: item.content.config?.meta?.openGraph?.locale || '',
                },
                twitter: {
                    card: item.content.config?.meta?.twitter?.card || '',
                    title: item.content.config?.meta?.twitter?.title || '',
                    description: item.content.config?.meta?.twitter?.description || '',
                },
            },
            descriptions: {
                header: item.content.config?.descriptions?.header || '<p></p>',
                footer: item.content.config?.descriptions?.footer || '<p></p>',
            },
        },
    })
    const singleSaveAction = useCustomAction(SaveReviewTaskToQSPay, {
        onSuccess: () => {
            toast.success('Successfully saved')
        },
    })
    const handleSubmit = async (values: PartialMetaOutput) => {
        singleSaveAction.execute([
            {
                config: values,
                contentId: item.content.id,
            },
        ])
    }

    const hasComparisonFields = (fields: string[]) => {
        return fields.map((field) => get(item.content.oldConfig, field)).some((field) => field !== undefined)
    }

    useEffect(() => {
        setDomReady(true)
    }, [])

    return (
        <div className="bg-muted flex flex-1 flex-col p-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" id="reviewForm">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Globe className="h-5 w-5 text-blue-600" />
                                    <CardTitle>Meta Contents</CardTitle>
                                </div>
                                {hasComparisonFields(['meta.title', 'meta.description', 'meta.category']) && (
                                    <Badge variant="secondary" className="text-xs">
                                        Comparison Available
                                    </Badge>
                                )}
                            </div>
                            <CardDescription>SEO meta information that appears in search results</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ComparisonFormField
                                control={form.control}
                                oldConfig={item.content.oldConfig}
                                name="meta.title"
                                type="input"
                                path="meta.title"
                                label="Meta Title"
                                description={
                                    <>
                                        The title that valued inside head section.e.g: <code>{'<title></title>'}</code>
                                    </>
                                }
                                errors
                                render={({ field }) => (
                                    <>
                                        <FormControl>
                                            <Input placeholder="Meta title" {...field} />
                                        </FormControl>
                                    </>
                                )}
                            />
                            <ComparisonFormField
                                control={form.control}
                                oldConfig={item.content.oldConfig}
                                name="meta.description"
                                type="textarea"
                                path="meta.description"
                                label="Meta Description"
                                description={
                                    <>
                                        {' '}
                                        The title that valued inside head section. e.g:{' '}
                                        <code>{"<meta name='description' content='...'/>"}</code>
                                    </>
                                }
                                errors
                                render={({ field }) => (
                                    <>
                                        <FormControl>
                                            <Textarea placeholder="Meta description" {...field} />
                                        </FormControl>
                                    </>
                                )}
                            />
                            <ComparisonFormField
                                control={form.control}
                                oldConfig={item.content.oldConfig}
                                name="meta.category"
                                type="input"
                                path="meta.category"
                                label="Meta Category"
                                description={
                                    <>
                                        Useful for e-commerce pages, defines the category of page e.g:{' '}
                                        <code>{"<meta name='category' content='hemden'/>"}</code>
                                    </>
                                }
                                errors
                                render={({ field }) => (
                                    <>
                                        <FormControl>
                                            <Input placeholder="Meta category" {...field} />
                                        </FormControl>
                                    </>
                                )}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <FacebookIcon className="h-5 w-5 text-blue-600" />
                                    <CardTitle>Facebook OpenGraph Controls</CardTitle>
                                </div>
                                {hasComparisonFields([
                                    'meta.openGraph.type',
                                    'meta.openGraph.title',
                                    'meta.openGraph.type',
                                    'meta.openGraph.locale',
                                    'meta.openGraph.description',
                                ]) && (
                                    <Badge variant="secondary" className="text-xs">
                                        Comparison Available
                                    </Badge>
                                )}
                            </div>
                            <CardDescription>
                                Link sharing preview meta contents used by Whatsapp or Facebook or other opengraph used
                                platforms
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ComparisonFormField
                                control={form.control}
                                oldConfig={item.content.oldConfig}
                                name="meta.openGraph.type"
                                type="input"
                                label="OpenGraph Type"
                                description={
                                    <>
                                        Type defines what the shared page is all about. Mostly selected value is{' '}
                                        <code>&ldquo;website&ldquo;</code>
                                    </>
                                }
                                errors
                                render={({ field }) => (
                                    <>
                                        <FormControl>
                                            <Input placeholder="OpenGraph type" {...field} />
                                        </FormControl>
                                    </>
                                )}
                            />
                            <ComparisonFormField
                                control={form.control}
                                oldConfig={item.content.oldConfig}
                                name="meta.openGraph.title"
                                type="input"
                                label="OpenGraph Title"
                                description={<>This will appear as the title of shared link preview</>}
                                errors
                                render={({ field }) => (
                                    <>
                                        <FormControl>
                                            <Input placeholder="OpenGraph title" {...field} />
                                        </FormControl>
                                    </>
                                )}
                            />
                            <ComparisonFormField
                                control={form.control}
                                oldConfig={item.content.oldConfig}
                                name="meta.openGraph.description"
                                type="textarea"
                                label="OpenGraph Description"
                                description={<>this will appear as a short text below title of shared link preview</>}
                                errors
                                render={({ field }) => (
                                    <>
                                        <FormControl>
                                            <Textarea placeholder="OpenGraph description" {...field} />
                                        </FormControl>
                                    </>
                                )}
                            />
                            <ComparisonFormField
                                control={form.control}
                                oldConfig={item.content.oldConfig}
                                name="meta.openGraph.locale"
                                type="input"
                                label="OpenGraph Locale"
                                description={<>Defines the locale of shared link target</>}
                                errors
                                render={({ field }) => (
                                    <>
                                        <FormControl>
                                            <Input placeholder="OpenGraph locale" {...field} />
                                        </FormControl>
                                    </>
                                )}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <TwitterIcon className="h-5 w-5 text-blue-600" />
                                    <CardTitle>Twitter SharedLinkPreview Controls</CardTitle>
                                </div>
                                {hasComparisonFields([
                                    'meta.twitter.card',
                                    'meta.twitter.title',
                                    'meta.twitter.description',
                                ]) && (
                                    <Badge variant="secondary" className="text-xs">
                                        Comparison Available
                                    </Badge>
                                )}
                            </div>
                            <CardDescription>
                                Link sharing preview meta contents used by Twitter owned platforms just like
                                Facebook&#39;s OpenGraph
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ComparisonFormField
                                control={form.control}
                                oldConfig={item.content.oldConfig}
                                name="meta.twitter.card"
                                type="input"
                                label="Twitter Card Type"
                                description={
                                    <>
                                        The card type. It&#39;s the card when you share something on twitter as post.
                                        most common value is <code>summary or summary_large_image</code>
                                    </>
                                }
                                errors
                                render={({ field }) => (
                                    <>
                                        <FormControl>
                                            <Input placeholder="Twitter card type" {...field} />
                                        </FormControl>
                                    </>
                                )}
                            />
                            <ComparisonFormField
                                control={form.control}
                                oldConfig={item.content.oldConfig}
                                name="meta.twitter.title"
                                type="input"
                                label="Twitter Card Title"
                                description={<>This will appear as the title of shared link preview</>}
                                errors
                                render={({ field }) => (
                                    <>
                                        <FormControl>
                                            <Input placeholder="Twitter title" {...field} />
                                        </FormControl>
                                    </>
                                )}
                            />
                            <ComparisonFormField
                                control={form.control}
                                oldConfig={item.content.oldConfig}
                                name="meta.twitter.description"
                                type="textarea"
                                label="Twitter Card Description"
                                description={<>This will appear as a short text below title of shared link preview</>}
                                errors
                                render={({ field }) => (
                                    <>
                                        <FormControl>
                                            <Textarea placeholder="Twitter description" {...field} />
                                        </FormControl>
                                    </>
                                )}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <NewspaperIcon className="h-5 w-5 text-blue-600" />
                                    <CardTitle>In-Site Content</CardTitle>
                                </div>
                                {hasComparisonFields(['descriptions.header', 'descriptions.footer']) && (
                                    <Badge variant="secondary" className="text-xs">
                                        Comparison Available
                                    </Badge>
                                )}
                            </div>
                            <CardDescription>
                                Page&#39;s physical content writings. Header (near banner) and Footer (below search
                                result) contents
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ComparisonFormField
                                control={form.control}
                                oldConfig={item.content.oldConfig}
                                name="descriptions.header"
                                type="html"
                                label="Page Header"
                                errors
                                render={({ field }) => (
                                    <>
                                        <FormControl>
                                            <TipTapEditor htmlOnly {...field} />
                                        </FormControl>
                                    </>
                                )}
                            />
                            <ComparisonFormField
                                control={form.control}
                                oldConfig={item.content.oldConfig}
                                name="descriptions.footer"
                                type="html"
                                label="Page Footer"
                                errors
                                render={({ field }) => (
                                    <>
                                        <FormControl>
                                            <TipTapEditor htmlOnly {...field} />
                                        </FormControl>
                                    </>
                                )}
                            />
                        </CardContent>
                    </Card>
                    {domReady &&
                        createPortal(
                            <Button type="submit" form="reviewForm" loading={singleSaveAction.isPending}>
                                <CheckIcon />
                                Approve
                            </Button>,
                            document.getElementById('review-form-portal-additional-handlers')!
                        )}
                </form>
            </Form>
        </div>
    )
}

export const ComparisonFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    oldConfig,
    type,
    path,
    label,
    render,
    description,
    errors,
    ...props
}: ControllerProps<TFieldValues, TName> & {
    type?: string
    label: string
    oldConfig?: MetaOutput | null
    description?: React.ReactNode
    errors?: boolean
    path?: string
}) => {
    const oldValue = get(oldConfig, path || props.name)

    if (!oldValue) {
        return (
            <FormField
                {...props}
                render={(renderProps) => (
                    <FormItem className="gap-0.5">
                        <div className="space-y-1">
                            <div className="mb-1.5 space-y-1">
                                <FormLabel>{label}</FormLabel>
                                {description && <FormDescription className="text-xs">{description}</FormDescription>}
                            </div>
                            <div className="text-muted-foreground flex items-center text-xs font-medium">
                                <div className="mr-2 h-2 w-2 rounded-full border border-green-300 bg-green-100"></div>
                                New Version
                            </div>
                        </div>
                        {render(renderProps)}
                        {errors && <FormMessage />}
                    </FormItem>
                )}
            />
        )
    }

    return (
        <FormField
            {...props}
            render={(renderProps) => (
                <FormItem className="gap-0.5">
                    <div className="mb-1.5 space-y-1">
                        <FormLabel>{label}</FormLabel>
                        {description && <FormDescription className="text-xs">{description}</FormDescription>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="text-muted-foreground flex items-center text-xs font-medium">
                                <div className="mr-2 h-2 w-2 rounded-full border border-gray-300 bg-gray-100"></div>
                                Previous Version
                            </div>
                            {(() => {
                                switch (type) {
                                    case 'textarea':
                                        return (
                                            <Textarea
                                                value={oldValue || 'No previous content'}
                                                readOnly
                                                className="resize-none border-gray-200 bg-gray-50 text-gray-700 opacity-60"
                                                rows={3}
                                            />
                                        )
                                    case 'input':
                                        return (
                                            <Input
                                                value={oldValue || 'No previous content'}
                                                readOnly
                                                className="border-gray-200 bg-gray-50 text-gray-700 opacity-60"
                                            />
                                        )
                                    case 'html':
                                        return (
                                            <div
                                                className="prose prose-sm dark:prose-invert opacity-60"
                                                dangerouslySetInnerHTML={{ __html: oldValue }}
                                            />
                                        )
                                }
                            })()}
                        </div>
                        <div className="space-y-1">
                            <div className="text-muted-foreground flex items-center text-xs font-medium">
                                <div className="mr-2 h-2 w-2 rounded-full border border-green-300 bg-green-100"></div>
                                New Version
                            </div>
                            {render(renderProps)}
                        </div>
                    </div>
                    {errors && <FormMessage className="text-xs" />}
                </FormItem>
            )}
        />
    )
}
