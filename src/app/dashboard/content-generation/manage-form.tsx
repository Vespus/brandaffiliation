"use client"

import { CompletionStream } from "@/app/dashboard/content-generation/actions";
import { AIModelSelect } from "@/app/dashboard/content-generation/form-elements/ai-model-select";
import { BrandSelect } from "@/app/dashboard/content-generation/form-elements/brand-select";
import { CategorySelect } from "@/app/dashboard/content-generation/form-elements/category-select";
import { DataSourceSelector } from "@/app/dashboard/content-generation/form-elements/datasource-selector";
import { DataSourceValueSelector } from "@/app/dashboard/content-generation/form-elements/datasource-value-selector";
import { PromptSelector } from "@/app/dashboard/content-generation/form-elements/prompt-selector";
import { ContentGenerateSchema } from "@/app/dashboard/content-generation/schema";
import { useContentGenerationStore } from "@/app/dashboard/content-generation/store";
import {
    useContentGenerationQueryParams
} from "@/app/dashboard/content-generation/use-content-generation-query-params";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Legend } from "@/components/ui/legend";
import { Scroller } from "@/components/ui/scroller";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { readStreamableValue } from "ai/rsc";
import { PlusIcon, Sparkles, XIcon } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

export const ManageForm = () => {
    const form = useForm<z.infer<typeof ContentGenerateSchema>>({
        resolver: zodResolver(ContentGenerateSchema),
        defaultValues: {
            prompt: undefined,
            brand: undefined,
            category: undefined,
            aiModel: [],
            dataSources: []
        },
    })
    const {setParams} = useContentGenerationQueryParams()
    const contentStore = useContentGenerationStore()

    async function onSubmit(values: z.infer<typeof ContentGenerateSchema>) {
        contentStore.setProgressState("started")
        const response = await CompletionStream(values);
        contentStore.setProgressState("loading")
        Promise.all(
            response.map(async ({model, streamValue}) => {
                for await (const value of readStreamableValue(streamValue)) {
                    contentStore.saveStream(model, value || {})
                }
            })
        ).then(() => {
            contentStore.setProgressState("complete")
        })
    }

    const {fields, append, remove} = useFieldArray({
        name: "dataSources",
        control: form.control
    });
    const {brand, category} = form.watch()
    useEffect(() => {
        setParams({
            brand: brand || null,
            category: category || null
        })
    }, [brand, category]);

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
                            <Legend>Content Settings</Legend>
                            <FormField
                                control={form.control}
                                name="brand"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Brand</FormLabel>
                                        <BrandSelect value={field.value} onValueChange={field.onChange}/>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <CategorySelect value={field.value} onValueChange={field.onChange}/>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <Legend>AI Settings</Legend>
                            <div
                                className="space-y-6"
                            >

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
                                            <AIModelSelect onValueChange={field.onChange} value={field.value}/>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div>
                                <Legend>Data Sources</Legend>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="my-4"
                                    onClick={() => append({
                                        datasourceId: undefined,
                                        datasourceValueId: undefined,
                                        datasourcePrompt: ""
                                    })}
                                >
                                    <PlusIcon/>
                                    Add Data Source
                                </Button>
                                <div className="space-y-4">
                                    {
                                        fields.map((field, index) => (
                                            <Card key={index}>
                                                <CardContent className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`dataSources.${index}.datasourceId`}
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <FormLabel>Source</FormLabel>
                                                                    <DataSourceSelector onValueChange={field.onChange}
                                                                                        value={field.value}/>
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`dataSources.${index}.datasourceValueId`}
                                                            render={({field}) => (
                                                                <FormItem>
                                                                    <FormLabel>Source Value</FormLabel>
                                                                    <DataSourceValueSelector
                                                                        onValueChange={field.onChange}
                                                                        value={field.value}
                                                                        index={index}
                                                                    />
                                                                    <FormMessage/>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <FormField
                                                        control={form.control}
                                                        name={`dataSources.${index}.datasourcePrompt`}
                                                        render={({field}) => (
                                                            <FormItem>
                                                                <FormLabel>Source Prompt</FormLabel>
                                                                <Textarea
                                                                    {...field}
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    placeholder="Prompt to append to the system prompt"
                                                                />
                                                                <FormMessage/>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </CardContent>
                                                <CardFooter className="justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => remove(index)}
                                                    >
                                                        <XIcon/> Remove
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))
                                    }
                                </div>
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
                    loading={contentStore.progressState === "loading"}
                >
                    <Sparkles className="mr-2 h-4 w-4"/>
                    Generate Content
                </Button>
            </div>
        </div>
    )
}
