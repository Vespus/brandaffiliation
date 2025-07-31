'use client'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { saveTask } from '@/app/dashboard/batch-studio/actions'
import { AiModelSelect } from '@/app/dashboard/batch-studio/form-elements/ai-model-select'
import { BatchContentGenerateSchema } from '@/app/dashboard/batch-studio/schema'
import { useDataTableSelectionStore } from '@/app/dashboard/batch-studio/store'
import { DataSources } from '@/app/dashboard/content-generation/form-elements/datasources'
import { PromptSelector } from '@/app/dashboard/content-generation/form-elements/prompt-selector'
import { TipTapEditor } from '@/components/tiptap/editor'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Legend } from '@/components/ui/legend'
import { Scroller } from '@/components/ui/scroller'
import { useCustomAction } from '@/hooks/use-custom-action'

export const ManageForm = () => {
    const router = useRouter()
    const form = useForm<z.infer<typeof BatchContentGenerateSchema>>({
        resolver: zodResolver(BatchContentGenerateSchema),
        defaultValues: {
            prompt: undefined,
            aiModel: undefined,
            useBrandContent: true,
            userPromptPrefix: '',
            dataSources: [],
        },
    })

    const selectedRows = useDataTableSelectionStore((s) => s.selected)
    const saveTaskAction = useCustomAction(saveTask, {
        onSuccess: () => {
            toast.success('Successfully added to queue', {
                position: 'bottom-center',
                action: {
                    label: 'Go to tasks',
                    onClick: () => router.push('/dashboard/batch-studio/tasks'),
                },
            })
        },
    })

    async function onSubmit(values: z.infer<typeof BatchContentGenerateSchema>) {
        if (Object.keys(selectedRows).length === 0) {
            toast.error('Please select at least one entity to generate content for')
            return
        }

        const input = Object.entries(selectedRows)
            .filter(([, value]) => Boolean(value))
            .map(([key]) => {
                return {
                    entityType: 'brand',
                    entityId: key,
                    status: 'pending',
                    specification: values,
                }
            })

        saveTaskAction.execute(input)
    }

    return (
        <div className="3xl:max-w-xl flex min-h-0 w-full flex-none flex-col gap-0 py-4 pr-4 md:max-w-md">
            <div className="flex-none">
                <h1 className="text-lg font-semibold">Brand Batch Studio</h1>
                <p className="text-muted-foreground text-sm">Choose AI model and customize your prompt</p>
            </div>
            <div className="min-h-0 flex-1">
                <Scroller className="h-full">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-6">
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
                                            <AiModelSelect value={field.value} onValueChange={field.onChange} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="space-y-4">
                                <Legend className="mb-4">Content Enrichment</Legend>
                                <FormField
                                    control={form.control}
                                    name="userPromptPrefix"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Custom User Prompt</FormLabel>
                                            <FormControl>
                                                <TipTapEditor {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="useBrandContent"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex flex-row items-center gap-2">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={(checked) => field.onChange(checked)}
                                                    />
                                                </FormControl>
                                                <FormLabel>
                                                    Use brand existing content, characteristics and scales if matched
                                                </FormLabel>
                                            </div>
                                            <FormDescription className="text-xs">
                                                If a QSPay brand matched in Brandaffiliation, system will append their
                                                Brandaffiliation data to enrich the prompt
                                            </FormDescription>
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
                    loading={saveTaskAction.isPending}
                    className="w-full"
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Add to Queue
                </Button>
            </div>
        </div>
    )
}
