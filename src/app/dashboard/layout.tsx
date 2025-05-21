import {Sidebar} from "@/components/sidebar/sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    const session = await auth();

    if(!session?.user) {
        redirect("/auth/sign-in")
    }

    console.log(session.user)
    return (
        <SidebarProvider className="h-0">
            <Sidebar user={session.user}/>
            <SidebarInset className="max-w-full">
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                    </div>
                </header>
                <main className="flex flex-col flex-1 px-4 mb-8 min-h-0">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}