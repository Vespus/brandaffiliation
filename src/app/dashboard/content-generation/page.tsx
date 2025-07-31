import { redirect } from 'next/navigation'

import { ContentGenerationProvider } from '@/app/dashboard/content-generation/content-generation-context'
import { QspayApplyDialog } from '@/app/dashboard/content-generation/dialogs/qspay-apply-dialog'
import { ManageForm } from '@/app/dashboard/content-generation/manage-form'
import { TemporaryStudio } from '@/app/dashboard/content-generation/temporary-studio'
import { getStore } from '@/utils/get-store'

export default async function Page() {
    const store = await getStore()

    if (!store) {
        redirect('/dashboard?error=store-missing')
    }

    return (
        <ContentGenerationProvider store={store}>
            <div className="flex max-h-[calc(100svh_-_calc(var(--spacing)_*_16)_-_calc(var(--spacing)_*_4)))] min-h-0 flex-1 gap-4 divide-x border-t">
                <ManageForm />
                <TemporaryStudio />
            </div>
            <QspayApplyDialog />
        </ContentGenerationProvider>
    )
}
