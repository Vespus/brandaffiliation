import {searchParamsCache} from "@/app/dashboard/batch-studio/brands/queries";
import {SearchParams} from "nuqs/server";
import {BrandsWidget} from "@/app/dashboard/batch-studio/widgets/brands-widget";
import {CategoriesWidget} from "@/app/dashboard/batch-studio/widgets/categories-widget";
import {CombinationsWidget} from "@/app/dashboard/batch-studio/widgets/combinations-widget";
import React from "react";


type BrandsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function Page(props: BrandsPageProps) {
    const searchParams = await props.searchParams;
    const search = searchParamsCache.parse(searchParams);

    return (
        <>
            <div className="flex flex-none flex-col min-h-0 flex-wrap gap-4 pb-6 xl:flex-row xl:gap-0 border-b">
                <BrandsWidget/>
                <div
                    className="relative w-0 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-muted hidden xl:block"></div>
                <CategoriesWidget/>
                <div
                    className="relative w-0 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-muted hidden xl:block"></div>
                <CombinationsWidget/>
            </div>
        </>
    )
}