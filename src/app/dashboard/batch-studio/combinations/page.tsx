import { SearchParams } from 'nuqs/server'
import { BatchStudioCombinationTable } from '@/app/dashboard/batch-studio/combinations/batch-studio-combination-table'
import { getCombinations, searchParamsCache } from '@/app/dashboard/batch-studio/combinations/queries'
import { CommonForm } from '@/app/dashboard/batch-studio/common-form'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'

type BrandsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function Page(props: BrandsPageProps) {
    const searchParams = await props.searchParams
    const search = searchParamsCache.parse(searchParams)

    const promise = getCombinations(search)

    return (
        <div className="flex min-h-0 flex-1 gap-4">
            <div className="3xl:max-w-xl flex min-h-0 w-full flex-none flex-col gap-0 py-4 pr-4 md:max-w-md">
                <div className="flex items-start gap-2">
                    <Link href="/dashboard/batch-studio" className="mt-0.5">
                        <ArrowLeftIcon />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-semibold">Combinations Batch Studio</h1>
                        <p className="text-muted-foreground text-sm">Choose AI model and customize your prompt</p>
                    </div>
                </div>
                <CommonForm entityType="combination" />
            </div>
            <BatchStudioCombinationTable promise={promise} />
        </div>
    )
}
