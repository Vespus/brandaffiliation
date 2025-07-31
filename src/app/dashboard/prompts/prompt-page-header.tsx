'use client'

import Link from 'next/link'

import { PlusIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export const PromptPageHeader = () => {
    return (
        <div className="flex items-center justify-between">
            <h1 className="mb-6 text-2xl font-bold">Manage System Prompts</h1>
            <Link href="/dashboard/prompts/new" className={buttonVariants({ variant: 'outline' })}>
                <PlusIcon />
                Add New System Prompt
            </Link>
        </div>
    )
}
