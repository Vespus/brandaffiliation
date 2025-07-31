import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const BrandInfoCardSkeleton = () => {
    return (
        <Card className="flex-none">
            <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex flex-col">
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-32" />
                    <ul className="flex flex-col gap-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Skeleton className="h-3 w-3" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
