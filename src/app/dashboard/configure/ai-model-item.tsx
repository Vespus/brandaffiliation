"use client"

import {TableCell, TableRow} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {AIModel} from "@/db/schema";
import {useRouter} from "next/navigation";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Settings} from "lucide-react";

export const AIModelItem = ({model}: {model: AIModel}) => {
    const router = useRouter()

    const handleModelSelect = () => {
        router.push(`/dashboard/configure/${model.id}`)
    }

    return (
        <TableRow
            className={cn("cursor-pointer")}
            onClick={handleModelSelect}
        >
            <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                    {model.name}
                </div>
            </TableCell>
            <TableCell>
                <Badge variant="outline" className="text-xs">
                    {model.provider}
                </Badge>
            </TableCell>
            <TableCell>1</TableCell>
            <TableCell>22222</TableCell>
            <TableCell className="text-right">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleModelSelect}
                    className="h-8 w-8"
                >
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Configure {model.name}</span>
                </Button>
            </TableCell>
        </TableRow>
    )
}