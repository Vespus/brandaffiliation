import { notFound } from "next/navigation";
import { getDatasourceById } from "@/app/dashboard/datasources/queries";
import { getDatasourceValues } from "./queries";
import { DatasourceDetailHeader } from "./datasource-detail-header";
import { DatasourceValuesTable } from "./datasource-values-table";
import { Suspense } from "react";

interface DatasourceDetailPageProps {
    params: Promise<{id: string}>;
}

export default async function DatasourceDetailPage(props: DatasourceDetailPageProps) {
    const params = await props.params
    const id = parseInt(params.id);

    if (isNaN(id)) {
        return notFound();
    }

    const datasource = await getDatasourceById(id);

    if (!datasource) {
        return notFound();
    }

    const valuesPromise = getDatasourceValues(id);

    return (
        <div className="max-w-7xl">
            <DatasourceDetailHeader datasource={datasource}/>
            <Suspense fallback={<div>Loading values...</div>}>
                <DatasourceValuesTable promise={valuesPromise} datasource={datasource}/>
            </Suspense>
        </div>
    );
}