import { ModelItemSkeleton } from "@/app/dashboard/configure/model-item-skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const ModelsSkeleton = () => {
    const skeletonItems = Array.from({length: 5}, (_, i) => i);

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Models</CardTitle>
                <CardDescription>Select AI model to configure</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Model</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Temperature</TableHead>
                            <TableHead>Max Tokens</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {skeletonItems.map((i) => (
                            <ModelItemSkeleton key={i}/>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};