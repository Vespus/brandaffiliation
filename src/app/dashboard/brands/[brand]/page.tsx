import { eq } from "drizzle-orm";
import { db } from "@/db";
import { brandWithScales } from "@/db/schema";
import { Suspense } from "react";
import { BrandInfoCard } from "./components/brand-info-card";
import { PerformanceRatingsCard } from "./components/performance-ratings-card";
import { PerformanceSummaryCard } from "./components/performance-summary-card";
import { NeighborScaleType } from "./components/neighbor-scale-type";
import { BrandInfoCardSkeleton } from "./components/skeletons/brand-info-card-skeleton";
import { PerformanceRatingsCardSkeleton } from "./components/skeletons/performance-ratings-card-skeleton";
import { PerformanceSummaryCardSkeleton } from "./components/skeletons/performance-summary-card-skeleton";
import { NeighborScaleTypeSkeleton } from "./components/skeletons/neighbor-scale-type-skeleton";
import { ScaleWeightsForm } from "./scale-weights-form";
import { SearchParams } from "nuqs/server";

type BrandPageProps = {
    params: Promise<{ brand: string }>;
    searchParams: Promise<SearchParams>

}

export default async function Brand(props: BrandPageProps) {
    const {brand: brandSlug} = await props.params;
    const searchParams = await props.searchParams;

    const [[brand], scales] = await Promise.all([
        db.select().from(brandWithScales).where(eq(brandWithScales.slug, brandSlug)).limit(1),
        db.query.scales.findMany(),
    ]);

    return (
        <div className="flex max-w-7xl flex-col gap-4">
            <div className="flex gap-4">
                <Suspense fallback={<BrandInfoCardSkeleton/>}>
                    <BrandInfoCard brand={brand}/>
                </Suspense>
                <Suspense fallback={<PerformanceRatingsCardSkeleton/>}>
                    <PerformanceRatingsCard brand={brand} scales={scales}/>
                </Suspense>
            </div>
            <Suspense fallback={<PerformanceSummaryCardSkeleton/>}>
                <PerformanceSummaryCard brand={brand} scales={scales}/>
            </Suspense>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <Suspense fallback={<NeighborScaleTypeSkeleton/>}>
                        <NeighborScaleType brand={brand} searchParams={searchParams}/>
                    </Suspense>
                </div>
                <div>
                    <ScaleWeightsForm />
                </div>
            </div>
        </div>
    );
}
