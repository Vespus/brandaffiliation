import {ManageForm} from "@/app/dashboard/content-generation/batch-studio/manage-form";
import {searchParamsCache} from "@/app/dashboard/content-generation/batch-studio/queries";
import {SearchParams} from "nuqs/server";


type BrandsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function Page(props: BrandsPageProps) {
    const searchParams = await props.searchParams;
    const search = searchParamsCache.parse(searchParams);

    return (
        <ManageForm/>
    )
}