import { SearchParams } from 'nuqs/server'
import { BatchStudioBrandTable } from '@/app/dashboard/batch-studio/brands/batch-studio-brand-table'
import { ManageForm } from '@/app/dashboard/batch-studio/brands/manage-form'
import { getBrands, searchParamsCache } from '@/app/dashboard/batch-studio/brands/queries'

type BrandsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function Page(props: BrandsPageProps) {
    const searchParams = await props.searchParams
    const search = searchParamsCache.parse(searchParams)

    const promise = getBrands(search)

    return (
        <div className="flex min-h-0 flex-1 gap-4">
            <ManageForm />
            <BatchStudioBrandTable promise={promise} />
        </div>
    )
}
