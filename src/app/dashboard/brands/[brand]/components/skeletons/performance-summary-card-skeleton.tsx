import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScaleStrengthsSkeleton } from "./scale-strengths-skeleton";

export const PerformanceSummaryCardSkeleton = () => {
    return (
        <Card>
            <CardContent className="flex flex-col gap-4">
                <div className="mb-4">
                    <CardHeader className="flex items-center px-0 space-x-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-40" />
                    </CardHeader>
                </div>
                <div className="flex flex-col gap-2 rounded-lg px-4 py-4 bg-muted">
                    <div className="flex items-center text-xs space-x-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-10" />
                    </div>
                    <div>
                        <Skeleton className="h-2 w-full" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {Array.from({length: 6}).map((_, i) => (
                        <ScaleStrengthsSkeleton key={i} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
