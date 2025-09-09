import { Suspense } from 'react'

import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { ArrowLeftIcon } from 'lucide-react'
import { SearchParams } from 'nuqs/server'
import { BatchStudioCombinationTable } from '@/app/dashboard/batch-studio/combinations/batch-studio-combination-table'
import { CommonForm } from '@/app/dashboard/batch-studio/common-form'
import { LogTable } from '@/app/dashboard/logs/log-table'
import { getLogs, searchParamsCache } from '@/app/dashboard/logs/queries'
import { DataTableSkeleton } from '@/components/datatable/data-table-skeleton'

type BrandsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function Page(props: BrandsPageProps) {
    const cookie = await cookies()
    const storeId = cookie.get('qs-pay-store-id')?.value

    if (!storeId) {
        redirect('/dashboard?error=store-missing')
    }

    const searchParams = await props.searchParams
    const search = searchParamsCache.parse(searchParams)

    const promise = getLogs(search)

    return (
        <div className="flex min-h-0 flex-1 gap-4">
            <Suspense fallback={<DataTableSkeleton columnCount={6} />}>
                <LogTable promise={promise} />
            </Suspense>
        </div>
    )
}
