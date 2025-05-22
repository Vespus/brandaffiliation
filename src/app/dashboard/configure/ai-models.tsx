import { AIModelItem } from "@/app/dashboard/configure/ai-model-item";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { db } from "@/db";
import { getAISettings } from "@/db/presets";
import { aiModels } from "@/db/schema";
import { AISetting } from "@/db/types";
import { eq } from "drizzle-orm";

export const AIModels = async () => {
    const [AIModels, AISettings] = await Promise.all([
        db.query.aiModels.findMany({
            where: (
                eq(aiModels.isActive, true)
            ),
            with: {
                aiProvider: {
                    columns: {
                        name: true,
                        code: true
                    }
                }
            }
        }),
        getAISettings()
    ])

    const settingsMap = new Map((AISettings as AISetting[]).map(setting => [setting.model, setting]))

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
                        {
                            AIModels.map((model) => (
                                <AIModelItem
                                    key={model.id}
                                    model={model}
                                    settings={settingsMap.get(model.modelName)!}
                                />
                            ))
                        }
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}