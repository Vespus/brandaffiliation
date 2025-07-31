import { SearchParams } from 'nuqs/server'
import { BatchStudioCombinationTable } from '@/app/dashboard/batch-studio/combinations/batch-studio-combination-table'
import { ManageForm } from '@/app/dashboard/batch-studio/combinations/manage-form'
import { getCombinations, searchParamsCache } from '@/app/dashboard/batch-studio/combinations/queries'

type BrandsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function Page(props: BrandsPageProps) {
    const searchParams = await props.searchParams
    const search = searchParamsCache.parse(searchParams)

    const promise = getCombinations(search)

    return (
        <div className="flex min-h-0 flex-1 gap-4">
            <ManageForm />
            <BatchStudioCombinationTable promise={promise} />
        </div>
    )
}
