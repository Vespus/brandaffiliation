"use client";

import { Button } from "@/components/ui/button";
import { Datasource } from "@/db/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DatasourceDetailHeaderProps {
    datasource: Datasource;
}

export function DatasourceDetailHeader({ datasource }: DatasourceDetailHeaderProps) {
    return (
        <div className="flex flex-col space-y-2 mb-6">
            <div className="flex items-center space-x-2">
                <Link href="/dashboard/datasources">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-2xl font-bold">{datasource.name}</h1>
                {datasource.isMultiple && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                        Multiple Select
                    </span>
                )}
            </div>
            {datasource.description && (
                <p className="text-muted-foreground">{datasource.description}</p>
            )}
            <div className="flex space-x-4 text-sm">
                <div>
                    <span className="font-medium">Value Column:</span> {datasource.valueColumn}
                </div>
                <div>
                    <span className="font-medium">Display Column:</span> {datasource.displayColumn}
                </div>
            </div>
        </div>
    );
}