import {Sidebar} from "@/components/sidebar/sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {createClient} from "@/db/supabase";

export default async function DashboardLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    const {data: {user}} = await (await createClient()).auth.getUser();

    return (
        <SidebarProvider>
            <Sidebar user={user}/>
            <SidebarInset className="max-w-full overflow-hidden">
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                    </div>
                </header>
                <main className="flex flex-col flex-1 px-4">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}