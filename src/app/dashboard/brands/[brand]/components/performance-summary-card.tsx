import { BrandWithCharacteristicAndScales, Scale } from "@/db/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartBarBig } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScaleStrengths } from "./scale-strengths";
import { Suspense } from "react";
import { ScaleStrengthsSkeleton } from "./skeletons/scale-strengths-skeleton";

interface PerformanceSummaryCardProps {
    brand: BrandWithCharacteristicAndScales;
    scales: Scale[];
}

export const PerformanceSummaryCard = ({brand, scales}: PerformanceSummaryCardProps) => {
    const overallRating =
        scales
            .map((scale) => brand[scale.label as keyof typeof brand] as number)
            .reduce((a, b) => a + b, 0) / scales.length;

    return (
        <Card>
            <CardContent className="flex flex-col gap-4">
                <div className="mb-4">
                    <CardHeader className="flex items-center px-0 space-x-2">
                        <ChartBarBig/>
                        Performance Summary
                    </CardHeader>
                </div>
                <div className="flex flex-col gap-2 rounded-lg px-4 py-4 bg-muted">
                    <div className="flex items-center text-xs space-x-2">
                        <span className="font-semibold">Overall Rating:</span>
                        <span className="tabular-nums">{overallRating.toFixed(1)}/5</span>
                    </div>
                    <div>
                        <Progress value={(overallRating / 5) * 100}/>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {scales.map((scale) => (
                        <Suspense key={scale.label} fallback={<ScaleStrengthsSkeleton />}>
                            <ScaleStrengths scale={scale.label} brand={brand}/>
                        </Suspense>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
