import Link from 'next/link'
import { unauthorized } from 'next/navigation'

import { ArrowLeft } from 'lucide-react'
import { PromptForm } from '@/app/dashboard/prompts/[id]/prompt-form'
import { auth } from '@/lib/auth'
import { getUser } from '@/lib/get-user'

export default async function NewPromptPage() {
    const { user } = await getUser()
    const { success } = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            role: 'admin',
            permission: {
                prompt: ['create'],
            },
        },
    })

    if (!success) {
        unauthorized()
    }

    return (
        <div className="flex w-full max-w-7xl flex-col gap-6">
            <div className="flex items-center space-x-2">
                <Link href="/dashboard/prompts">
                    <ArrowLeft />
                </Link>
                <h1 className="text-2xl font-semibold">Create New System Prompt</h1>
            </div>
            <PromptForm />
        </div>
    )
}
