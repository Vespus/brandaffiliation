import { Metadata } from 'next'

import { ProfileForm } from '@/app/dashboard/profile/profile-form'
import { getUser } from '@/lib/get-user'

export const metadata: Metadata = {
    title: 'Profile | Brand Affiliation',
    description: 'Manage your profile settings',
}

export default async function ProfilePage() {
    const { user } = await getUser()

    return (
        <div className="container mx-auto py-10">
            <div className="mx-auto max-w-3xl">
                <ProfileForm user={user} />
            </div>
        </div>
    )
}
