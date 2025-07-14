"use client"

import {TableCell, TableRow} from "@/components/ui/table";
import {TaskJoin} from "@/app/dashboard/batch-studio/tasks/type";
import {api} from "@/lib/trpc/react";
import {useEffect, useState} from "react";
import {Progress} from "@/components/ui/progress";
import {cn} from "@/lib/utils";

type EntityProps = {
    task: TaskJoin
    shouldStart: boolean
    onJobComplete?: (task: TaskJoin) => void
    onJobStart?: (task: TaskJoin) => void
    onJobError?: (task: TaskJoin) => void
}

export const Entity = ({
                           task,
                           shouldStart,
                           onJobStart,
                           onJobComplete
                       }: EntityProps) => {
    const jobCall = api.batchStudioRoute.process.useMutation({
        onSuccess: () => {
            setProgress(100)
            setStatus("success")
            onJobComplete?.(task)
        },
        onSettled: () => {
            setProgress(100)
        },
        onError: () => {
            setStatus("error")
        }
    })
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [progress, setProgress] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    const simulateProgress = () => {
        let current = 0;
        const interval = setInterval(() => {
            current += Math.random() * 10;
            setProgress(p => Math.min(p + 5, 90)); // Cap at 90% until real result

            if (current >= 90) clearInterval(interval);
        }, 300);
    };

    const processTask = () => {
        jobCall.mutate(task.task)
    }

    useEffect(() => {
        if (shouldStart && !hasStarted) {
            setHasStarted(true);
            onJobStart?.(task)
            setStatus("loading");
            simulateProgress();
            processTask();
        }
    }, [shouldStart]);

    return (
        <TableRow>
            <TableCell>{task.task.id}</TableCell>
            <TableCell>{task.entityName}</TableCell>
            <TableCell>{task.task.entityType}</TableCell>
            <TableCell>{task.combination?.description || "N/A"}</TableCell>
            <TableCell>{task.category?.description || "N/A"}</TableCell>
            <TableCell>{task.brand?.name || "N/A"}</TableCell>
            <TableCell>
                <div className="flex flex-col space-y-2">
                    <span
                        className={cn(
                            "text-xs capitalize",
                            status === "success" && "text-green-600",
                            status === "error" && "text-red-600",
                            status === "loading" && "text-yellow-600",
                            status === "idle" && "text-muted-foreground"
                        )}
                    >
                        {status}
                    </span>
                    <Progress value={progress}/>
                </div>
            </TableCell>
        </TableRow>
    )
}