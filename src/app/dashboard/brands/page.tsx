import {getBrands, searchParamsCache} from "@/app/dashboard/brands/queries";
import {SearchParams} from "nuqs/server";
import {BrandTable} from "@/app/dashboard/brands/brand-table";
import {Suspense} from "react";
import {DataTableSkeleton} from "@/components/datatable/data-table-skeleton";

type BrandsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function BrandsPage(props: BrandsPageProps) {
    const searchParams = await props.searchParams;
    const search = searchParamsCache.parse(searchParams);

    const promise = getBrands(search)

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Alle Marken
                </h1>
                <p className="text-lg text-gray-600">
                    Eine Übersicht aller verfügbaren Marken
                </p>
            </div>
            <Suspense fallback={<DataTableSkeleton columnCount={6} />}>
                <BrandTable promise={promise} />
            </Suspense>
        </div>
    );
} 