import { SearchParams } from 'nuqs/server'
import { BatchStudioCategoryTable } from '@/app/dashboard/batch-studio/categories/batch-studio-category-table'
import { getCategories, searchParamsCache } from '@/app/dashboard/batch-studio/categories/queries'
import { CommonForm } from '@/app/dashboard/batch-studio/common-form'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'

type CategoriesPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function Page(props: CategoriesPageProps) {
    const searchParams = await props.searchParams
    const search = searchParamsCache.parse(searchParams)

    const promise = getCategories(search)

    return (
        <div className="flex min-h-0 flex-1 gap-4">
            <div className="3xl:max-w-xl flex min-h-0 w-full flex-none flex-col gap-0 py-4 pr-4 md:max-w-md">
                <div className="flex items-start gap-2">
                    <Link href="/dashboard/batch-studio" className="mt-0.5">
                        <ArrowLeftIcon />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-semibold">Categories Batch Studio</h1>
                        <p className="text-muted-foreground text-sm">Choose AI model and customize your prompt</p>
                    </div>
                </div>
                <CommonForm entityType="category" />
            </div>
            <BatchStudioCategoryTable promise={promise} />
        </div>
    )
}
