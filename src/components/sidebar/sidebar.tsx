import type * as React from 'react'

import { User } from 'better-auth'
import { NavHeader } from '@/components/sidebar/nav-header'
import { NavList } from '@/components/sidebar/nav-list'
import { NavUser } from '@/components/sidebar/nav-user'
import {
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    Sidebar as SidebarUI,
} from '@/components/ui/sidebar'

type SidebarType = React.ComponentProps<typeof SidebarUI> & {
    user: User | null
}

export function Sidebar({ user, ...props }: SidebarType) {
    return (
        <SidebarUI collapsible="icon" {...props}>
            <SidebarHeader>
                <NavHeader />
            </SidebarHeader>
            <SidebarContent>
                <NavList />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </SidebarUI>
    )
}
