import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const PerformanceRatingsCardSkeleton = () => {
    return (
        <Card className="flex-1">
            <CardContent className="flex flex-col gap-4">
                <div>
                    <CardHeader className="flex items-center px-0 space-x-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-40" />
                    </CardHeader>
                </div>
                <div>
                    <div className="grid grid-cols-3 gap-6">
                        {Array.from({length: 6}).map((_, i) => (
                            <div key={i} className="flex flex-col">
                                <div className="flex justify-between gap-4 mb-1">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-3 w-8" />
                                </div>
                                <div className="flex">
                                    {Array.from({length: 5}).map((_, j) => (
                                        <Skeleton key={j} className="h-4 w-4 mx-0.5 rounded-full" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
