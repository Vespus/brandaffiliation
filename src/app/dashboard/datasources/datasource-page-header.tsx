'use client'

import { PlusIcon } from 'lucide-react'
import { useDatasourceParams } from '@/app/dashboard/datasources/use-datasource-params'
import { Button } from '@/components/ui/button'

export const DatasourcePageHeader = () => {
    const { setParams } = useDatasourceParams()

    return (
        <div className="flex items-center justify-between">
            <h1 className="mb-6 text-2xl font-bold">Manage Datasources</h1>
            <Button
                variant="outline"
                onClick={() => {
                    setParams({ createDatasource: true })
                }}
            >
                <PlusIcon />
                Add new Datasource
            </Button>
        </div>
    )
}
