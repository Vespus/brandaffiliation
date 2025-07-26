import { DatasourceEditDialog } from "@/app/dashboard/datasources/datasource-edit-dialog";
import { DatasourcePageHeader } from "@/app/dashboard/datasources/datasource-page-header";
import { getDatasources, searchParamsCache } from "@/app/dashboard/datasources/queries";
import { Suspense } from "react";
import { DatasourceCreateForm } from './datasource-create-form';
import { DatasourceTable } from './datasource-table';
import { SearchParams } from "nuqs/server";

interface DatasourcesPageProps {
    searchParams: Promise<SearchParams>
}

export default async function DataSourcesPage(props: DatasourcesPageProps) {
    const searchParams = await props.searchParams;
    const parsedParams = searchParamsCache.parse(searchParams);
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