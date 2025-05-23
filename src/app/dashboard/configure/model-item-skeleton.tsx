import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export const ModelItemSkeleton = () => {
    return (
        <TableRow>
            <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                </div>
            </TableCell>
            <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-8" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-12" />
            </TableCell>
            <TableCell className="text-right">
                <Skeleton className="h-8 w-8 rounded-md ml-auto" />
            </TableCell>
        </TableRow>
    );
};