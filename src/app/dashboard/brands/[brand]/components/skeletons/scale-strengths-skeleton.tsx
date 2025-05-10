import { Skeleton } from "@/components/ui/skeleton";

export const ScaleStrengthsSkeleton = () => {
    return (
        <div className="flex flex-col text-xs">
            <Skeleton className="h-4 w-24 mb-2" />
            <ul className="list-inside list-disc">
                {[1, 2, 3].map((i) => (
                    <li key={i} className="flex items-center gap-2 my-1">
                        <Skeleton className="h-3 w-full" />
                    </li>
                ))}
            </ul>
        </div>
    );
};