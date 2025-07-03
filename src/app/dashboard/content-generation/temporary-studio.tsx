"use client"

import { SaveToQSPay } from "@/app/dashboard/content-generation/actions";
import { useContentGenerationContext } from "@/app/dashboard/content-generation/content-generation-context";
import { ProviderIcon } from "@/app/dashboard/content-generation/form-elements/provider-icon";
import { useContentGenerationStore } from "@/app/dashboard/content-generation/store";
import {
    useContentGenerationQueryParams
} from "@/app/dashboard/content-generation/use-content-generation-query-params";
import { BaseNode } from "@/components/base-node";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ComboboxBase } from "@/components/ui/combobox-base";
import { Label } from "@/components/ui/label";
import { Legend } from "@/components/ui/legend";
import { Scroller } from "@/components/ui/scroller";
import { useCustomAction } from "@/hooks/use-custom-action";
import { api } from "@/lib/trpc/react";
import { ExternalLinkIcon, SendIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const TemporaryStudio = () => {
    const state = useContentGenerationStore()
    const {store} = useContentGenerationContext()
    const {setParams} = useContentGenerationQueryParams()
    const brandId = useContentGenerationStore(state => state.selectedBrand)
    const categoryId = useContentGenerationStore(state => state.selectedCategory)

    const {data: categories} = api.qspayRoute.getAllCategories.useQuery(undefined, {enabled: !!categoryId})
    const {data: brands} = api.qspayRoute.getAllBrands.useQuery(undefined, {enabled: !!brandId})

    //combobox
    const [selectedOutputModel, setSelectedOutputModel] = useState<number | undefined>(undefined);
    const outputModelData = Object.entries(state.streams).map(([modelId, stream]) => ({
        label: stream.model.name,
        value: modelId,
        description: stream.model.description,
    }));

    //category/brand
    const selectedCategory = categories?.find(cat => cat.id === categoryId?.toString())
    const selectedBrand = brands?.find(brand => brand.id === brandId?.toString())
    const possibleUrl = [
        store.storeUrl,
        selectedCategory?.slug.replace(/\//g, ""),
        selectedBrand?.slug.replace(/\//g, ""),
    ].filter(Boolean).join("/")

    //handlers
    const handleExport = async () => {
        const selectedStreamId = (selectedOutputModel || outputModelData[0]?.value) as number
        setParams({
            selectedStream: selectedStreamId,
        })
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="h-16 border-b flex items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        {selectedCategory &&
                            <div className="text-xs">
                                <span className="text-xs text-muted-foreground">Category:{" "}</span>
                                <span className="">{selectedCategory.description}</span>
                            </div>
                        }
                        {selectedBrand &&
                            <div className="text-xs">
                                <span className="text-xs text-muted-foreground">Brand:{" "}</span>
                                <span className="">{selectedBrand.description}</span>
                            </div>
                        }
                    </div>
                    {(selectedBrand || selectedCategory) &&
                        <div className="text-xs">
                            <span className="text-muted-foreground">Possible Affecting URL:{" "}</span>
                            <a
                                href={possibleUrl}
                                className="inline-flex gap-2"
                                target="_blank"
                            >
                                <span>{possibleUrl}</span>
                                <ExternalLinkIcon
                                    size={12}
                                    className="size-auto"
                                />
                            </a>
                        </div>
                    }
                </div>
                <div className="flex gap-4">
                    <div className="flex gap-2">
                        <Label className="flex-none text-xs">Output Model: </Label>
                        <div className="w-xs">
                            <ComboboxBase
                                labelKey="label"
                                valueKey="value"
                                data={outputModelData}
                                value={selectedOutputModel?.toString() || outputModelData[0]?.value || ""}
                                onValueChange={val => setSelectedOutputModel(Number(val))}
                            />
                        </div>
                    </div>
                    <Button onClick={handleExport}
                            disabled={!state.streams.length && state.progressState !== "complete"}>
                        <SendIcon/>
                        Edit & Send to QSPAY
                    </Button>
                </div>
            </div>
            <div className="px-12 py-4 flex-1 flex items-center">
                <Carousel className="w-full">
                    <CarouselContent className="-ml-4">
                        {Object.entries(state.streams).map(([modelId, stream], index) => (
                            <CarouselItem className="basis-1 pl-4 lg:basis-1/2 2xl:basis-1/3" key={modelId}>
                                <div className="p-1">
                                    <BaseNode>
                                        <div className="-mx-5 -mt-5 mb-4 flex flex-col rounded-t-md p-5 bg-muted">
                                            <div className="flex justify-between">
                                                <h3 className="font-semibold">{stream.model.name}</h3>
                                                <div className="flex items-center space-x-2">
                                                    <ProviderIcon providerCode={stream.model.provider.code!}/>
                                                    <span
                                                        className="text-xs text-muted-foreground">{stream.model.provider.name}</span>
                                                </div>
                                            </div>
                                            <div
                                                className="text-xs text-muted-foreground">{stream.model.description}</div>
                                        </div>
                                        <Scroller className="space-y-6 max-h-[400px]">
                                            <div>
                                                <Legend className="mb-2">Meta Information</Legend>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex flex-col space-y-1">
                                                        <h3 className="text-xs font-medium">Title:</h3>
                                                        <p className="text-xs text-muted-foreground">{stream.stream?.meta?.title}</p>
                                                    </div>
                                                    <div className="flex flex-col space-y-1">
                                                        <h3 className="text-xs font-medium">Description:</h3>
                                                        <p className="text-xs text-muted-foreground">{stream.stream?.meta?.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <Legend className="mb-2">Hero Content</Legend>
                                                <div className="flex flex-col gap-2">
                                                    <div
                                                        className="flex flex-col space-y-1">
                                                        <h3 className="text-xs font-medium">Hero Header (Page Header
                                                            Content):</h3>
                                                        <div
                                                            className="text-xs text-muted-foreground prose prose-sm dark:prose-invert [&>h1]:text-xs"
                                                            dangerouslySetInnerHTML={{__html: stream.stream?.descriptions?.header}}></div>
                                                    </div>
                                                    <div className="flex flex-col space-y-1">
                                                        <h3 className="text-xs font-medium">Hero Footer (Page Bottom
                                                            Content):</h3>
                                                        <div className="text-xs text-muted-foreground prose prose-sm dark:prose-invert [&>h1]:text-xs"
                                                           dangerouslySetInnerHTML={{__html: stream.stream?.descriptions?.footer}}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Scroller>
                                    </BaseNode>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious/>
                    <CarouselNext/>
                </Carousel>
            </div>
        </div>
    )
}