'use client'

import { ModelItem } from '@/app/dashboard/configure/model-item'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AIModel, AIProvider, AISetting } from '@/db/types'

type ModelProps = {
    aiModels: (AIModel & {
        aiProvider: Pick<AIProvider, 'name' | 'code'>
    })[]
    aiSettings: AISetting[]
}

export const Models = ({ aiModels, aiSettings }: ModelProps) => {
    const settingsMap = new Map(aiSettings.map((setting) => [setting.model, setting]))

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
                        {aiModels.map((model) => (
                            <ModelItem
                                key={model.id}
                                model={model}
                                settings={settingsMap.get(model.modelName)!}
                            ></ModelItem>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
