import { QSPayService } from "@/components/qspay/qspay-service";
import {Sidebar} from "@/components/sidebar/sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    if(!session?.user) {
        redirect("/auth/sign-in")
    }

    return (
        <SidebarProvider>
            <Sidebar user={session.user} variant="inset"/>
            <SidebarInset className="max-w-full">
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <QSPayService />
                    </div>
                </header>
                <div className="flex flex-col flex-1 px-4 min-h-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}