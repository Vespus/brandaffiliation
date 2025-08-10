'use client'

import { useMemo } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ChevronRight } from 'lucide-react'
import { MenuItem } from '@/components/sidebar/type'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export const CollapsableMenuItem = ({ item }: { item: MenuItem }) => {
    const pathname = usePathname()
    const splitPathname = useMemo(
        () =>
            pathname
                .split('/')
                .filter(Boolean)
                .filter((x) => x !== 'dashboard'),
        [pathname]
    )
    const isAnyChildActive = useMemo(
        () =>
            item.children?.some(
                (x) =>
                    splitPathname[0] ===
                    x.url
                        ?.split('/')
                        .filter(Boolean)
                        .filter((x) => x !== 'dashboard')
                        .shift()
            ),
        [item, splitPathname]
    )

    return (
        <Collapsible key={item.name} asChild defaultOpen={isAnyChildActive} className="group/collapsible">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.name} className={cn(isAnyChildActive && 'font-semibold')}>
                        {item.icon && <item.icon />}
                        <span>{item.name}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.children?.map((subItem) => (
                            <CollapsableMenuSubItem key={subItem.name} item={subItem} />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}

const CollapsableMenuSubItem = ({ item }: { item: MenuItem }) => {
    const pathname = usePathname()

    return (
        <SidebarMenuSubItem key={item.name}>
            <SidebarMenuSubButton
                asChild
                className={cn(item.url === pathname && 'font-semibold text-indigo-500')}
            >
                <Link href={item.url!}>
                    <span>{item.name}</span>
                </Link>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    )
}
