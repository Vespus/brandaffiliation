'use client'

import { useMemo } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { MenuItem } from '@/components/sidebar/type'
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export const SingleMenuItem = ({ item }: { item: MenuItem }) => {
    const pathname = usePathname()
    const splitPathname = useMemo(
        () =>
            pathname
                .split('/')
                .filter(Boolean)
                .filter((x) => x !== 'dashboard'),
        [pathname]
    )
    const splitItemPathname = useMemo(
        () =>
            item
                .url!.split('/')
                .filter(Boolean)
                .filter((x) => x !== 'dashboard'),
        [item]
    )

    return (
        <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
                asChild
                tooltip={item.name}
                className={cn(splitPathname[0] === splitItemPathname[0] && 'font-semibold text-indigo-500')}
            >
                <Link href={item.url!}>
                    {item.icon && <item.icon />}
                    <span>{item.name}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}
