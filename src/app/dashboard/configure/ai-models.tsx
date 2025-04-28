import {Table, TableBody, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {db} from "@/db";
import {AIModelItem} from "@/app/dashboard/configure/ai-model-item";

export const AIModels = async () => {
    const aiModels = await db.query.aiModels.findMany()

    return (
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
                {
                    aiModels.map((model) => (
                        <AIModelItem key={model.id} model={model} />
                    ))
                }
            </TableBody>
        </Table>
    )
}