import {ManageForm} from "@/app/dashboard/batch-studio/combinations/manage-form";
import {SearchParams} from "nuqs/server";
import {BatchStudioContextProvider} from "@/app/dashboard/batch-studio/brands/context";
import {BatchStudioCombinationTable} from "@/app/dashboard/batch-studio/combinations/batch-studio-combination-table";
import {getCombinations, searchParamsCache} from "@/app/dashboard/batch-studio/combinations/queries";


type BrandsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function Page(props: BrandsPageProps) {
    const searchParams = await props.searchParams;
    const search = searchParamsCache.parse(searchParams);

    const promise = getCombinations(search)

    return (
        <BatchStudioContextProvider>
            <div className="flex flex-1 gap-4 min-h-0">
                <ManageForm/>
                <BatchStudioCombinationTable promise={promise}/>
            </div>
        </BatchStudioContextProvider>
    )
}