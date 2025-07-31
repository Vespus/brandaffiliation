import { Suspense } from 'react'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { QSPayService } from '@/components/qspay/qspay-service'
import { Sidebar } from '@/components/sidebar/sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { QSPayContextProvider } from '@/hooks/contexts/use-qspay-context'
import { auth } from '@/lib/auth'
import { getQspayUser } from '@/lib/get-qspay-user'

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const cookie = await cookies()
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    if (!session?.user) {
        redirect('/auth/sign-in')
    }

    const QSPayUser = await getQspayUser()
    const storeId = cookie.get('qs-pay-store-id')?.value

    return (
        <QSPayContextProvider user={QSPayUser} storeId={storeId}>
            <SidebarProvider>
                <Sidebar user={session.user} variant="inset" />
                <SidebarInset className="min-w-0">
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
                        <div className="flex items-center gap-2 px-8">
                            <SidebarTrigger className="-ml-1" />
                            <Suspense>
                                <QSPayService />
                            </Suspense>
                        </div>
                    </header>
                    <div className="flex min-h-0 flex-1 flex-col px-8">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </QSPayContextProvider>
    )
}
