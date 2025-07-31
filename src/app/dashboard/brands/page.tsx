import { Suspense } from 'react'

import { SearchParams } from 'nuqs/server'
import { BrandTable } from '@/app/dashboard/brands/brand-table'
import { getBrands, searchParamsCache } from '@/app/dashboard/brands/queries'
import { DataTableSkeleton } from '@/components/datatable/data-table-skeleton'

type BrandsPageProps = {
    searchParams: Promise<SearchParams>
}

export default async function BrandsPage(props: BrandsPageProps) {
    const searchParams = await props.searchParams
    const search = searchParamsCache.parse(searchParams)

    const promise = getBrands(search)

    return (
        <div className="space-y-6">
            <header className="prose dark:prose-invert prose-sm">
                <h1 className="mb-2 text-2xl font-bold">Entdecken Sie die Welt der Marken</h1>
                <p className="mt-1 text-base">
                    Tauchen Sie ein in unsere umfassende Sammlung von Marken, die für Qualität und Stil stehen. Hier
                    finden Sie alles, was Sie über unsere verfügbaren Marken wissen müssen.
                </p>
            </header>
            <hr />
            <Suspense fallback={<DataTableSkeleton columnCount={6} />}>
                <BrandTable promise={promise} />
            </Suspense>
        </div>
    )
}
