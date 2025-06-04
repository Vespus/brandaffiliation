"use client"
import {useDatasourceParams} from "@/app/dashboard/datasources/use-datasource-params";
import {Button} from "@/components/ui/button";
import {PlusIcon} from "lucide-react";

export const DatasourcePageHeader = () => {
    const {setParams} = useDatasourceParams()

    return (
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold mb-6">Manage Datasources</h1>
            <Button
                variant="outline"
                onClick={() => {
                    setParams({createDatasource: true})
                }}
            >
                <PlusIcon/>
                Add new Datasource
            </Button>
        </div>
    )
}