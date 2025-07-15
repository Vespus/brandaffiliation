"use client"

import {Table, TableBody, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Entity} from "@/app/dashboard/batch-studio/tasks/entity";
import {TaskJoin} from "@/app/dashboard/batch-studio/tasks/type";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";

const MAX_CONCURRENCY = 5;

export const TaskController = ({tasks}: { tasks: TaskJoin[] }) => {
    const [runningIds, setRunningIds] = useState<number[]>([]);
    const [finishedIds, setFinishedIds] = useState<number[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const startProcess = () => {
        setIsRunning(true)
    }

    const handleTaskFinished = (task: TaskJoin) => {
        setRunningIds(prev => prev.filter(i => i !== task.task.id));
        setFinishedIds(prev => [...prev, task.task.id]);
    };

    useEffect(() => {
        if (!isRunning || isPaused) return;

        const remaining = tasks.filter(task =>
            !runningIds.includes(task.task.id) &&
            !finishedIds.includes(task.task.id)
        );

        const canStart = MAX_CONCURRENCY - runningIds.length;
        const toStart = remaining.slice(0, canStart);

        if (toStart.length > 0) {
            setRunningIds(prev => [...prev, ...toStart.map(t => t.task.id)]);
        }
    }, [runningIds, finishedIds, tasks, isRunning]);

    return (
        <div className="container">
            <Button onClick={startProcess}>Process</Button>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Identifier</TableHead>
                        <TableHead>Task Name</TableHead>
                        <TableHead>Task Type</TableHead>
                        <TableHead>Combination Name</TableHead>
                        <TableHead>Category Name</TableHead>
                        <TableHead>Brand Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        tasks.map(task => (
                            <Entity
                                key={task.task.entityType + task.task.entityId}
                                task={task as TaskJoin}
                                shouldStart={isRunning && runningIds.includes(task.task.id)}
                                onJobComplete={handleTaskFinished}
                            />
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}