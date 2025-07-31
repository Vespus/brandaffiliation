import { redirect } from 'next/navigation'
import React from 'react'

import { ContentGenerationProvider } from '@/app/dashboard/content-generation/content-generation-context'
import { getStore } from '@/utils/get-store'

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    const store = await getStore()

    if (!store) {
        redirect('/dashboard?error=store-missing')
    }

    return <ContentGenerationProvider store={store}>{children}</ContentGenerationProvider>
}
