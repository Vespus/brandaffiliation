import {Table, TableBody, TableHead, TableHeader, TableRow, TableCell} from "@/components/ui/table"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

// Skeleton version of AIModelItem
const AIModelItemSkeleton = () => {
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

export const AIModelsSkeleton = () => {
  // Create an array of 5 items to simulate multiple rows
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
              <AIModelItemSkeleton key={i} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};