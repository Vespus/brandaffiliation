"use client"

import { SaveToQSPay } from "@/app/dashboard/content-generation/actions";
import { EmptyMetaState } from "@/app/dashboard/content-generation/dialogs/empty-meta-state";
import { useContentGenerationStore } from "@/app/dashboard/content-generation/store";
import { MetaOutput, MetaOutputSchema } from "@/app/dashboard/content-generation/types";
import {
    useContentGenerationQueryParams
} from "@/app/dashboard/content-generation/use-content-generation-query-params";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scroller } from "@/components/ui/scroller";
import { Textarea } from "@/components/ui/textarea";
import { useCustomAction } from "@/hooks/use-custom-action";
import { api } from "@/lib/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toMerged } from "es-toolkit";
import { get, set } from "es-toolkit/compat";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Type for the form data with selected fields
type FormDataWithSelection = {
    selectedFields: Record<string, boolean>;
    values: MetaOutput;
};

export const QspayApplyDialog = () => {
    const {selectedStream, setParams} = useContentGenerationQueryParams()
    const zustandStore = useContentGenerationStore()
    const streams = useContentGenerationStore(state => state.streams)
    const selectedBrand = useContentGenerationStore(state => state.selectedBrand)
    const selectedCategory = useContentGenerationStore(state => state.selectedCategory)

    const {data: foundEntity} = api.qspayRoute.getEntity.useQuery({
        categoryId: selectedCategory,
        brandId: selectedBrand
    }, {
        enabled: Boolean(selectedBrand || selectedCategory) && Boolean(selectedStream)
    })

    // Get the current stream data
    const currentStream = selectedStream ? streams[selectedStream] : null;
    const streamData = currentStream?.stream as MetaOutput;
    const entityData = foundEntity?.config as MetaOutput;

    const fieldMappings = [
        {
            title: "Meta",
            description: "Meta data for the page used by Search engines and browser tab displays",
            children: [
                {path: "meta.title", label: "Meta Title", type: Input},
                {path: "meta.description", label: "Meta Description", type: Textarea},
                {path: "meta.category", label: "Meta Category", type: Input},
                {path: "meta.robot", label: "Robot Meta Tag", type: Input},
            ]
        },
        {
            title: "Opengraph",
            description: "Meta data for sharing the page on social media platforms like Facebook and Twitter or Whatsapp",
            children: [
                {path: "meta.openGraph.type", label: "Open Graph Type", type: Input},
                {path: "meta.openGraph.title", label: "Open Graph Title", type: Textarea},
                {path: "meta.openGraph.description", label: "Open Graph Description", type: Textarea},
                {path: "meta.openGraph.locale", label: "Open Graph Locale", type: Input},
            ]
        },
        {
            title: "Twitter",
            description: "Meta data for sharing on twitter specific platforms",
            children: [
                {path: "meta.twitter.card", label: "Twitter Card Type", type: Input},
                {path: "meta.twitter.title", label: "Twitter Title", type: Textarea},
                {path: "meta.twitter.description", label: "Twitter Description", type: Textarea},
            ]
        },
        {
            title: "Page Descriptions",
            description: "Content for page. These will appear next to banner or footer of the selected entity(category, brand, etc.)",
            children: [
                {path: "descriptions.header", label: "Hero Header", type: Textarea},
                {path: "descriptions.footer", label: "Hero Footer", type: Textarea},
            ]
        },
    ];

    const exportAction = useCustomAction(SaveToQSPay, {
        onSuccess: () => {
            toast.success("Content successfully exported to QSPay")
            zustandStore.reset()
            setParams({selectedStream: null})
        }
    })

    const form = useForm<FormDataWithSelection>({
        resolver: zodResolver(z.object({
            selectedFields: z.record(z.boolean()),
            values: MetaOutputSchema
        })),
        defaultValues: {
            selectedFields: {},
            values: {
                descriptions: {
                    footer: "",
                    header: ""
                },
                meta: {
                    category: "",
                    description: "",
                    robot: "",
                    title: "",
                    openGraph: {
                        type: "",
                        locale: "",
                        title: "",
                        description: "",
                    },
                    twitter: {
                        card: "",
                        description: "",
                        title: ""
                    }
                }
            }
        }
    });

    const onSubmit = (data: FormDataWithSelection) => {
        // Filter the values to only include selected fields
        const filteredData: Partial<MetaOutput> = {};
        Object.entries(data.selectedFields).forEach(([path, isSelected]) => {
            if (isSelected) {
                const value = get(data.values, path.replace(/_/g, "."));
                if (value !== undefined) {
                    set(filteredData, path.replace(/_/g, "."), value);
                }
            }
        });

        const mergedOutput = toMerged(entityData || EmptyMetaState, filteredData) as MetaOutput;
        if (foundEntity?.type === 'combin') {
            exportAction.execute({
                brandId: foundEntity.brand.id,
                brandName: foundEntity.brand.name,
                categoryId: foundEntity.category.id,
                categoryName: foundEntity.category.name,
                output: mergedOutput
            })
        }
        if (foundEntity?.type === "brand" || foundEntity?.type === "category") {
            exportAction.execute({
                ...(selectedBrand && {
                    brandId: foundEntity!.id,
                    brandName: foundEntity?.name ?? "",
                }),
                ...(selectedCategory && {
                    categoryName: foundEntity?.name ?? "",
                    categoryId: foundEntity?.id ?? "",
                }),
                output: mergedOutput
            })
        }
    };

    useEffect(() => {
        if (streamData) {
            // Initialize selectedFields to false for all fields
            const selectedFields: Record<string, boolean> = {};
            fieldMappings.flatMap(x => x.children).forEach(({path}) => {
                selectedFields[path.replace(/\./g, "_")] = false;
            });

            form.reset({
                selectedFields,
                values: streamData
            });
        }
    }, [streamData]);

    if (!streamData || !foundEntity) {
        return null;
    }

    return (
        <Dialog
            open={Boolean(selectedStream)}
            onOpenChange={() => setParams({selectedStream: null})}
        >
            <DialogContent
                className="w-full lg:max-w-7xl max-h-[90vh] overflow-hidden"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Compare and Apply Changes</DialogTitle>
                    <DialogDescription>
                        Select which fields to update and modify their values. Check the boxes for fields you want to
                        apply.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                        <Scroller className="h-[600px]">
                            <div className="flex flex-col gap-4">
                                {fieldMappings.map(({title, description, children}) => (
                                    <Card key={title}>
                                        <CardHeader>
                                            <CardTitle>{title}</CardTitle>
                                            <CardDescription>{description}</CardDescription>
                                            <CardContent className="flex flex-col gap-4 py-4 px-0">
                                                <div className="sticky top-0 py-4 bg-background flex gap-4">
                                                    <div className="w-6"></div>
                                                    <div className="w-xs">Label</div>
                                                    <div className="flex-1">AI Output</div>
                                                    <div className="flex-1">Original Value</div>
                                                </div>
                                                {children.map(({path, label, type: Component}) => (
                                                    <div key={path}
                                                         className="flex gap-4 min-w-0 pb-4 border-b last:border-b-0">
                                                        <div className="w-6 flex-none flex justify-center">
                                                            <FormField
                                                                name={`selectedFields.${path.replace(/\./g, "_")}`}
                                                                control={form.control}
                                                                render={({field}) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value}
                                                                                onCheckedChange={field.onChange}
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                        <div className="w-xs flex-none">
                                                            <Label>{label}</Label>
                                                        </div>
                                                        <div className="flex-1">
                                                            <FormField
                                                                name={`values.${path}` as any}
                                                                control={form.control}
                                                                render={({field}) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <Component
                                                                                {...field}
                                                                                value={String(field.value || "")}
                                                                                onChange={(e: any) => field.onChange(e.target.value)}
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                        <div
                                                            className="flex-1 text-xs text-muted-foreground prose prose-sm dark:prose-invert [&>h1]:text-xs"
                                                            dangerouslySetInnerHTML={{__html: get(entityData, path) || "Not available"}}
                                                        />
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        </Scroller>
                        <DialogFooter className="border-t pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" loading={exportAction.isPending}>
                                Apply Selected Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};