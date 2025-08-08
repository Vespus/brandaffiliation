'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CompletionStream } from '@/app/dashboard/content-generation/actions'
import { AIModelSelect } from '@/app/dashboard/content-generation/form-elements/ai-model-select'
import { BrandSelect } from '@/app/dashboard/content-generation/form-elements/brand-select'
import { CategorySelect } from '@/app/dashboard/content-generation/form-elements/category-select'
import { DataSources } from '@/app/dashboard/content-generation/form-elements/datasources'
import { PromptSelector } from '@/app/dashboard/content-generation/form-elements/prompt-selector'
import { ContentGenerateSchema } from '@/app/dashboard/content-generation/schema'
import { useContentGenerationStore } from '@/app/dashboard/content-generation/store'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Legend } from '@/components/ui/legend'
import { Scroller } from '@/components/ui/scroller'
import { readStreamableValue } from "@ai-sdk/rsc"

export const ManageForm = () => {
    const form = useForm<z.infer<typeof ContentGenerateSchema>>({
        resolver: zodResolver(ContentGenerateSchema),
        defaultValues: {
            prompt: undefined,
            brand: undefined,
            category: undefined,
            aiModel: [],
            dataSources: [],
        },
    })

    const contentStore = useContentGenerationStore()

    async function onSubmit(values: z.infer<typeof ContentGenerateSchema>) {
        contentStore.reset()
        const response = await CompletionStream(values)
        contentStore.setProgressState('loading')
        contentStore.setCategoryId(Number(values.category))
        contentStore.setBrandId(Number(values.brand))

        Promise.all(
            response.map(async ({ model, streamValue }) => {
                for await (const value of readStreamableValue(streamValue)) {
                    contentStore.saveStream(model, value)
                }
            })
        ).then(() => {
            contentStore.setProgressState('complete')
        })
    }

    return (
        <div className="flex min-h-0 w-full flex-none flex-col gap-0 py-4 pr-4 xl:max-w-xl">
            <div className="flex-none">
                <h1 className="text-lg font-semibold">Generate SEO Content</h1>
                <p className="text-muted-foreground text-sm">Choose AI model and customize your prompt</p>
            </div>
            <div className="min-h-0 flex-1">
                <Scroller className="h-full">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-6">
                            <Legend>Content Settings</Legend>
                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brand</FormLabel>
                                        <BrandSelect value={field.value} onValueChange={field.onChange} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <CategorySelect value={field.value} onValueChange={field.onChange} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Legend>AI Settings</Legend>
                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="prompt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>System Prompt</FormLabel>
                                            <PromptSelector value={field.value} onChange={field.onChange} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="aiModel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>AI Model</FormLabel>
                                            <AIModelSelect onValueChange={field.onChange} value={field.value} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div>
                                <Legend>Data Sources</Legend>
                                <DataSources />
                            </div>
                        </form>
                    </Form>
                </Scroller>
            </div>
            <div className="flex flex-none py-4">
                <Button
                    type="button"
                    onClick={form.handleSubmit(onSubmit)}
                    className="w-full"
                    loading={contentStore.progressState === 'loading'}
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                </Button>
            </div>
        </div>
    )
}
