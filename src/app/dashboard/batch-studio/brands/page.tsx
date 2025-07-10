import {ManageForm} from "@/app/dashboard/batch-studio/manage-form";
import {getBrands, searchParamsCache} from "@/app/dashboard/batch-studio/brands/queries";
import {SearchParams} from "nuqs/server";
import {BatchStudioBrandTable} from "@/app/dashboard/batch-studio/brands/batch-studio-brand-table";
import {BatchStudioContextProvider} from "@/app/dashboard/batch-studio/brands/context";


type BrandsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function Page(props: BrandsPageProps) {
    const searchParams = await props.searchParams;
    const search = searchParamsCache.parse(searchParams);

    const promise = getBrands(search)

    return (
        <BatchStudioContextProvider>
            <div className="flex flex-1 gap-4 min-h-0">
                <ManageForm/>
                <BatchStudioBrandTable promise={promise}/>
            </div>
        </BatchStudioContextProvider>
    )
}