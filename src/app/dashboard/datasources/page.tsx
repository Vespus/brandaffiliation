import { DatasourceEditDialog } from "@/app/dashboard/datasources/datasource-edit-dialog";
import { DatasourcePageHeader } from "@/app/dashboard/datasources/datasource-page-header";
import { getDatasources, searchParamsCache } from "@/app/dashboard/datasources/queries";
import { Suspense } from "react";
import { DatasourceCreateForm } from './datasource-create-form';
import { DatasourceTable } from './datasource-table';

interface DatasourcesPageProps {
    searchParams: Record<string, string | string[]>;
}

export default async function DatasourcesPage({searchParams}: DatasourcesPageProps) {
    const parsedParams = await searchParamsCache.parse(searchParams);
    const datasourcesPromise = getDatasources(parsedParams);

    return (
        <div className="max-w-7xl">
            <DatasourcePageHeader/>
            <Suspense>
                <DatasourceTable promise={datasourcesPromise}/>
            </Suspense>
            <DatasourceEditDialog/>
            <DatasourceCreateForm/>
        </div>
    );
}