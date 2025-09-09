'use client';

import { Suspense } from 'react'

import { CogIcon, Database, GalleryVerticalEnd, Languages, SparklesIcon, TextSearchIcon, UsersIcon } from 'lucide-react'
import { CollapsableMenuItem } from '@/components/sidebar/collapsible-menu-item';
import { SingleMenuItem } from '@/components/sidebar/single-menu-item';
import { MenuItem } from '@/components/sidebar/type';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar';


const data: MenuItem[] = [
    {
        name: 'Alle Marken',
        url: '/dashboard/brands',
        icon: GalleryVerticalEnd,
    },
    {
        name: 'Generators',
        icon: SparklesIcon,
        children: [
            {
                name: 'SEO Generator',
                url: '/dashboard/content-generation',
            },
            {
                name: 'Batch Studio',
                url: '/dashboard/batch-studio',
            },
            {
                name: 'Tasks',
                url: '/dashboard/batch-studio/tasks',
            },
            {
                name: 'Reviews',
                url: '/dashboard/batch-studio/review',
            },
        ],
    },
    {
        name: 'Configure',
        url: '/dashboard/configure',
        icon: CogIcon,
    },
    {
        name: 'Translations',
        url: '/dashboard/translations',
        icon: Languages,
    },
    {
        name: 'Datasources',
        url: '/dashboard/datasources',
        icon: Database,
    },
    {
        name: 'System Prompts',
        url: '/dashboard/prompts',
        icon: SparklesIcon,
        permission: { role: 'admin', permission: { prompt: ['list'] } },
    },
    {
        name: 'Logs',
        url: '/dashboard/logs',
        icon: TextSearchIcon,
    },
    {
        name: 'Manage Users',
        url: '/dashboard/users',
        icon: UsersIcon,
        permission: { role: 'admin', permission: { users: ['list'] } },
    },
]

export const NavList = () => {
    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
                {data.map((item) => (
                    <Suspense key={item.name}>
                        <Guard item={item} />
                    </Suspense>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}

const Guard = ({ item }: { item: MenuItem }) => {
    /*const perm = use(new Promise(async resolve =>  {
        if(item.permission){
            resolve(true)
        }
        const res = await authClient.admin.hasPermission({
            permission: item.permission?.permission
        })

        console.log(res)
        resolve(true)
    }))*/

    return (
        <Suspense>
            {item.children && item.children.length > 0 ? (
                <CollapsableMenuItem item={item} />
            ) : (
                <SingleMenuItem item={item} />
            )}
        </Suspense>
    )
}
