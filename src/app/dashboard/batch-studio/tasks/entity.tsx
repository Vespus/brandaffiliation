import {TableCell, TableRow} from "@/components/ui/table";
import {TaskJoin} from "@/app/dashboard/batch-studio/tasks/type";
import {useEffect, useRef, useState} from "react";
import {Progress} from "@/components/ui/progress";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {PlayIcon} from "lucide-react";

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
                           onJobComplete,
                           onJobError
                       }: EntityProps) => {

    const interval = useRef<ReturnType<typeof setInterval> | number>(0);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [progress, setProgress] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const simulateProgress = () => {
        let current = 0;
        interval.current = setInterval(() => {
            current += Math.random() * 10;
            setProgress(p => Math.min(p + 5, 90));
            if (current >= 90) clearInterval(interval.current);
        }, 1500);
    };

    const processTask = async () => {
        setHasStarted(true);
        onJobStart?.(task)
        setStatus("loading");
        simulateProgress();

        try {
            const response = await fetch("/api/content-stream", {
                method: 'POST',
                body: JSON.stringify({taskId: task.task.id}),
            })

            if(!response.ok){
                setStatus("error")
                onJobError?.(task)
            }else{
                setStatus("success")
                onJobComplete?.(task)
            }
        } catch (e) {
            setStatus("error")
            onJobError?.(task)
        }

        clearInterval(interval.current)
        setProgress(100)
    }

    useEffect(() => {
        if (shouldStart && !hasStarted) {
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
                        {status} {status === "success" &&
                        <span className="text-muted-foreground">/ Waiting Review</span>}
                    </span>
                    <Progress value={progress}/>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={processTask}>
                        <PlayIcon/>
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    )
}