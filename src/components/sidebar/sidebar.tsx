"use client"

import type * as React from "react"

import {NavHeader} from "@/components/sidebar/nav-header"
import {NavList} from "@/components/sidebar/nav-list";
import {Sidebar as SidebarUI, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail} from "@/components/ui/sidebar"
import {ThemeToggle} from "@/components/theme-toggle";

export function Sidebar({...props}: React.ComponentProps<typeof SidebarUI>) {
    return (
        <SidebarUI collapsible="icon" {...props}>
            <SidebarHeader>
                <NavHeader/>
            </SidebarHeader>
            <SidebarContent>
                <NavList/>
            </SidebarContent>
            <SidebarFooter>
                <div className="flex items-center justify-center gap-2">
                    <ThemeToggle/>
                </div>
            </SidebarFooter>
            <SidebarRail/>
        </SidebarUI>
    )
}
