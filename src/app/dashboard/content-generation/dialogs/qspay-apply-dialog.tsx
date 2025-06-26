"use client"

import { useContentGenerationContext } from "@/app/dashboard/content-generation/content-generation-context";
import { useContentGenerationStore } from "@/app/dashboard/content-generation/store";
import {
    useContentGenerationQueryParams
} from "@/app/dashboard/content-generation/use-content-generation-query-params";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/trpc/react";

export const QspayApplyDialog = () => {
    const {selectedStream, setParams} = useContentGenerationQueryParams()
    const {store} = useContentGenerationContext()
    const streams = useContentGenerationStore(state => state.streams)
    const selectedBrand = useContentGenerationStore(state => state.selectedBrand)
    const selectedCategory = useContentGenerationStore(state => state.selectedCategory)

    const {data: foundEntity} = api.qspayRoute.getEntity.useQuery({categoryId: selectedCategory, brandId: selectedBrand}, {
        enabled: Boolean(selectedBrand || selectedCategory) && Boolean(selectedStream)
    })

    console.log(selectedBrand, selectedCategory, foundEntity)

    return (
        <Dialog open={Boolean(selectedStream)} onOpenChange={() => setParams({selectedStream: null})}>
            <DialogContent className="w-full lg:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Compare Original</DialogTitle>
                    <DialogDescription>Compare output with the original SEO data of selected
                        resource</DialogDescription>
                </DialogHeader>

            </DialogContent>
        </Dialog>
    )

}