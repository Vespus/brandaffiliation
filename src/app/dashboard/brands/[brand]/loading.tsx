import { BrandInfoCardSkeleton } from './components/skeletons/brand-info-card-skeleton'
import { PerformanceRatingsCardSkeleton } from './components/skeletons/performance-ratings-card-skeleton'
import { PerformanceSummaryCardSkeleton } from './components/skeletons/performance-summary-card-skeleton'

export default function Loading() {
    return (
        <div className="flex max-w-7xl flex-col gap-4">
            <div className="flex gap-4">
                <BrandInfoCardSkeleton />
                <PerformanceRatingsCardSkeleton />
            </div>
            <PerformanceSummaryCardSkeleton />
        </div>
    )
}
