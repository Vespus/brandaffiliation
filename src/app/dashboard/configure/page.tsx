import {getBrands, searchParamsCache} from "@/app/dashboard/brands/queries";
import {SearchParams} from "nuqs/server";
import {BrandTable} from "@/app/dashboard/brands/brand-table";
import {Suspense} from "react";
import {DataTableSkeleton} from "@/components/datatable/data-table-skeleton";
import {db} from "@/db";
import {AIModels} from "@/app/dashboard/configure/ai-models";

type BrandsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function BrandsPage(props: BrandsPageProps) {

    return (
        <div className="space-y-6">
            <header className="prose dark:prose-invert prose-sm">
                <h1 className="mb-2 text-2xl font-bold">AI Model Settings</h1>
                <p className="mt-1 text-base">
                    Configure parameters for your AI models. Settings are saved per model.
                </p>
            </header>
            <hr />
            <Suspense>
                <AIModels />
            </Suspense>

        </div>
    );
}