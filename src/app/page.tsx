import { redirect } from 'next/navigation'

import { getUser } from '@/lib/get-user'

export default async function Page() {
    const user = await getUser()

    if (user) {
        return redirect('/dashboard')
    }

    return null
}
