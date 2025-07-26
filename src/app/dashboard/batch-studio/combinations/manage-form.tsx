"use client"

import { DataSources } from "@/app/dashboard/content-generation/form-elements/datasources";
import { PromptSelector } from "@/app/dashboard/content-generation/form-elements/prompt-selector";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Legend } from "@/components/ui/legend";
import { Scroller } from "@/components/ui/scroller";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AiModelSelect } from "@/app/dashboard/batch-studio/form-elements/ai-model-select";
import { BatchContentGenerateSchema } from "@/app/dashboard/batch-studio/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { useDataTableSelectionStore } from "@/app/dashboard/batch-studio/store";
import { useCustomAction } from "@/hooks/use-custom-action";
import { saveTask } from "@/app/dashboard/batch-studio/actions";
import { toast } from "sonner";
import { TipTapEditor } from "@/components/tiptap/editor";
import { useRouter } from "next/navigation";

export const ManageForm = () => {
    const router = useRouter()
    const form = useForm<z.infer<typeof BatchContentGenerateSchema>>({
        resolver: zodResolver(BatchContentGenerateSchema),
        defaultValues: {
            prompt: undefined,
            aiModel: undefined,
            useBrandContent: true,
            useCategoryContent: true,
            userPromptPrefix: "",
            dataSources: []
        },
    })

    const selectedRows = useDataTableSelectionStore(s => s.selected)
    const saveTaskAction = useCustomAction(saveTask, {
        onSuccess: () => {
            toast.success("Successfully added to queue", {
                position: "bottom-center",
                action: {
                    label: "Go to tasks",
                    onClick: () => router.push("/dashboard/batch-studio/tasks")
                },
            })
        }
    })

    async function onSubmit(values: z.infer<typeof BatchContentGenerateSchema>) {
        if (Object.keys(selectedRows).length === 0) {
            toast.error("Please select at least one entity to generate content for", {
                position: "top-center"
            })
            return
        }

        const input = Object
            .entries(selectedRows)
            .filter(([, value]) => Boolean(value))
            .map(([key,]) => {
                return {
                    entityType: "combination",
                    entityId: key,
                    status: "pending",
                    specification: values,
                }
            })

        saveTaskAction.execute(input)
    }

    return (
        <div className="flex w-full flex-none flex-col gap-0 md:max-w-md 3xl:max-w-xl min-h-0 py-4 pr-4">
            <div className="flex-none ">
                <h1 className="text-lg font-semibold">Combinations Batch Studio</h1>
                <p className="text-sm text-muted-foreground">
                    Choose AI model and customize your prompt
                </p>
            </div>
            <div className="flex-1 min-h-0">
                <Scroller className="h-full">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                            <Legend>AI Settings</Legend>
                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="prompt"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>System Prompt</FormLabel>
                                            <PromptSelector value={field.value} onChange={field.onChange}/>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="aiModel"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>AI Model</FormLabel>
                                            <AiModelSelect value={field.value} onValueChange={field.onChange}/>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="space-y-4">
                                <Legend className="mb-4">Content Enrichment</Legend>
                                <FormField
                                    control={form.control}
                                    name="userPromptPrefix"
                                    render={({field}) => (
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
                                    render={({field}) => (
                                        <FormItem>
                                            <div className="flex flex-row items-center gap-2">
                                                <FormControl>
                                                    <Checkbox checked={field.value}
                                                              onCheckedChange={(checked) => field.onChange(checked)}/>
                                                </FormControl>
                                                <FormLabel>Use existing brand content</FormLabel>
                                            </div>
                                            <FormDescription className="text-xs">Brandaffiliation will append
                                                brand&#39;s information for extra content enrichment</FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="useCategoryContent"
                                    render={({field}) => (
                                        <FormItem>
                                            <div className="flex flex-row items-center gap-2">
                                                <FormControl>
                                                    <Checkbox checked={field.value}
                                                              onCheckedChange={(checked) => field.onChange(checked)}/>
                                                </FormControl>
                                                <FormLabel>Use existing category content</FormLabel>
                                            </div>
                                            <FormDescription className="text-xs">BrandAffiliation will append category
                                                information for extra content enrichment</FormDescription>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div>
                                <Legend>Data Sources</Legend>
                                <DataSources/>
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
                    <Sparkles className="mr-2 h-4 w-4"/>
                    Add to Queue
                </Button>
            </div>
        </div>
    )
}
