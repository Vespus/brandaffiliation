import { SearchParams } from 'nuqs/server'
import { BatchStudioCategoryTable } from '@/app/dashboard/batch-studio/categories/batch-studio-category-table'
import { ManageForm } from '@/app/dashboard/batch-studio/categories/manage-form'
import { getCategories, searchParamsCache } from '@/app/dashboard/batch-studio/categories/queries'

type CategoriesPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function Page(props: CategoriesPageProps) {
    const searchParams = await props.searchParams
    const search = searchParamsCache.parse(searchParams)

    const promise = getCategories(search)

    return (
        <div className="flex min-h-0 flex-1 gap-4">
            <ManageForm />
            <BatchStudioCategoryTable promise={promise} />
        </div>
    )
}
