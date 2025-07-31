'use client'

import { PlusIcon } from 'lucide-react'
import { useTranslationParams } from '@/app/dashboard/translations/use-translation-params'
import { Button } from '@/components/ui/button'

export const TranslationPageHeader = () => {
    const { setParams } = useTranslationParams()

    return (
        <div className="flex items-center justify-between">
            <h1 className="mb-6 text-2xl font-bold">Manage Translations</h1>
            <Button
                variant="outline"
                onClick={() => {
                    setParams({ createTranslation: true })
                }}
            >
                <PlusIcon />
                Add new Translation
            </Button>
        </div>
    )
}
