import { Suspense } from 'react'

import { ChartBarBig } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BrandWithCharacteristicAndScales, Scale } from '@/db/types'
import { ScaleStrengths } from './scale-strengths'
import { ScaleStrengthsSkeleton } from './skeletons/scale-strengths-skeleton'

interface PerformanceSummaryCardProps {
    brand: BrandWithCharacteristicAndScales
    scales: Scale[]
}

export const PerformanceSummaryCard = ({ brand, scales }: PerformanceSummaryCardProps) => {
    const overallRating =
        scales.map((scale) => brand[scale.label as keyof typeof brand] as number).reduce((a, b) => a + b, 0) /
        scales.length

    return (
        <Card>
            <CardContent className="flex flex-col gap-4">
                <div className="mb-4">
                    <CardHeader className="flex items-center space-x-2 px-0">
                        <ChartBarBig />
                        Performance Summary
                    </CardHeader>
                </div>
                <div className="bg-muted flex flex-col gap-2 rounded-lg px-4 py-4">
                    <div className="flex items-center space-x-2 text-xs">
                        <span className="font-semibold">Overall Rating:</span>
                        <span className="tabular-nums">{overallRating.toFixed(1)}/5</span>
                    </div>
                    <div>
                        <Progress value={(overallRating / 5) * 100} />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {scales.map((scale) => (
                        <Suspense key={scale.label} fallback={<ScaleStrengthsSkeleton />}>
                            <ScaleStrengths scale={scale.label} brand={brand} />
                        </Suspense>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
