"use client"

import { buttonVariants } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export const PromptPageHeader = () => {
    return (
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold mb-6">Manage System Prompts</h1>
            <Link
                href="/dashboard/prompts/new"
                className={buttonVariants({variant: "outline"})}
            >
                <PlusIcon/>
                Add New System Prompt
            </Link>
        </div>
    )
}