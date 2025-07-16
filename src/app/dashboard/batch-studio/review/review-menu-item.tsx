"use client"

import Link from "next/link";
import {Button} from "@/components/ui/button";
import {XIcon} from "lucide-react";
import React from "react";
import {ReviewJoin} from "@/app/dashboard/batch-studio/tasks/type";

export const ReviewMenuItem = ({item}: {item: ReviewJoin}) => {
    const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        return true
    }

    return (
        <li key={item.content.id} className="flex flex-col border-b">
            <Link href={`/dashboard/batch-studio/review/${item.content.id}`}
                  className="flex justify-between gap-4 p-2">
                <div className="flex flex-col">
                    <span className="text-xs">{item.entityName}</span>
                    <span
                        className="capitalize text-muted-foreground text-xs">{item.content.entityType}</span>
                </div>
                <div className="flex justify-end gap-2">
                    <Button
                        className="py-0 px-1"
                        size="sm"
                        variant="ghost"
                        onClick={handleRemove}
                    >
                        <XIcon/>
                    </Button>
                </div>
            </Link>
        </li>
    )
}