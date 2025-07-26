import { ManageForm } from "@/app/dashboard/batch-studio/categories/manage-form";
import { BatchStudioCategoryTable } from "@/app/dashboard/batch-studio/categories/batch-studio-category-table";
import { getCategories, searchParamsCache } from "@/app/dashboard/batch-studio/categories/queries";
import { SearchParams } from "nuqs/server";


type CategoriesPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function Page(props: CategoriesPageProps) {
    const searchParams = await props.searchParams;
    const search = searchParamsCache.parse(searchParams);

    const promise = getCategories(search)

    return (
        <div className="flex flex-1 gap-4 min-h-0">
            <ManageForm/>
            <BatchStudioCategoryTable promise={promise}/>
        </div>
    )
}