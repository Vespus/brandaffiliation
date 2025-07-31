'use client'

import Link from 'next/link'

import { ArrowLeft } from 'lucide-react'
import { Datasource } from '@/db/types'

interface DatasourceDetailHeaderProps {
    datasource: Datasource
}

export function DatasourceDetailHeader({ datasource }: DatasourceDetailHeaderProps) {
    return (
        <div className="mb-6 flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
                <Link href="/dashboard/datasources">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <h1 className="text-2xl font-bold">{datasource.name}</h1>
                {datasource.isMultiple && (
                    <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Multiple Select
                    </span>
                )}
            </div>
            {datasource.description && <p className="text-muted-foreground">{datasource.description}</p>}
            <div className="flex space-x-4 text-sm">
                <div>
                    <span className="font-medium">Value Column:</span>
                    {datasource.valueColumn}
                </div>
                <div>
                    <span className="font-medium">Display Column:</span>
                    {datasource.displayColumn}
                </div>
            </div>
        </div>
    )
}
