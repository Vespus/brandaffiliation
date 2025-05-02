"use client"

import * as React from "react"
import {
    GalleryVerticalEnd
} from "lucide-react"

import {SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar"
import {useRouter} from "next/navigation";

export function NavHeader() {
    const router = useRouter()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    role="button"
                    onClick={() => router.push('/dashboard')}
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <div
                        className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <GalleryVerticalEnd className="size-4"/>
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Brand Affiliation</span>
                        <span className="truncate text-xs">Herrenausstatter</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
