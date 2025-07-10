"use client"

import { DataSources } from "@/app/dashboard/content-generation/form-elements/datasources";
import { PromptSelector } from "@/app/dashboard/content-generation/form-elements/prompt-selector";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Legend } from "@/components/ui/legend";
import { Scroller } from "@/components/ui/scroller";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {AiModelSelect} from "@/app/dashboard/batch-studio/form-elements/ai-model-select";
import {BatchContentGenerateSchema} from "@/app/dashboard/batch-studio/schema";

export const ManageForm = () => {
    const form = useForm<z.infer<typeof BatchContentGenerateSchema>>({
        resolver: zodResolver(BatchContentGenerateSchema),
        defaultValues: {
            prompt: undefined,
            aiModel: undefined,
            dataSources: []
        },
    })

    async function onSubmit(values: z.infer<typeof BatchContentGenerateSchema>) {
        console.log(values)
    }

    return (
        <div className="flex w-full flex-none flex-col gap-0 xl:max-w-xl min-h-0 py-4 pr-4">
            <div className="flex-none ">
                <h1 className="text-lg font-semibold">Generate SEO Content</h1>
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
                                            <AiModelSelect value={field.value} onValueChange={field.onChange} />
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
                    className="w-full"
                >
                    <Sparkles className="mr-2 h-4 w-4"/>
                    Generate Content
                </Button>
            </div>
        </div>
    )
}
