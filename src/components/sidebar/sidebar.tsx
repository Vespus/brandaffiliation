"use client"

import type * as React from "react"

import {NavHeader} from "@/components/sidebar/nav-header"
import {NavList} from "@/components/sidebar/nav-list";
import {Sidebar as SidebarUI, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail} from "@/components/ui/sidebar"
import {NavUser} from "@/components/sidebar/nav-user";
import { User } from "next-auth";

type SidebarType = React.ComponentProps<typeof SidebarUI> & {
    user: User | null
}
export function Sidebar({user, ...props}: SidebarType) {
    return (
        <SidebarUI collapsible="icon" {...props}>
            <SidebarHeader>
                <NavHeader/>
            </SidebarHeader>
            <SidebarContent>
                <NavList/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail/>
        </SidebarUI>
    )
}
