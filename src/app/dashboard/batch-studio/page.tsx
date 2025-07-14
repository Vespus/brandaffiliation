import {searchParamsCache} from "@/app/dashboard/batch-studio/brands/queries";
import {SearchParams} from "nuqs/server";


type BrandsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function Page(props: BrandsPageProps) {
    const searchParams = await props.searchParams;
    const search = searchParamsCache.parse(searchParams);

    return (
        <>
            pikachu
        </>
    )
}