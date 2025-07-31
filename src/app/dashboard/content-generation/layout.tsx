import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    /*const session = await getUser()*/
    const cookieList = await cookies()
    /*const {error} = await auth.api.userHasPermission({
        body: {
            userId: session.user.id,
            role: "user",
            permissions: {
                contentGeneration: ["list", "create"],
            },
        }
    })*/

    if (!cookieList.has('qs-pay-store-id')) {
        redirect('/dashboard?error=store-missing')
    }

    return <>{children}</>
}
