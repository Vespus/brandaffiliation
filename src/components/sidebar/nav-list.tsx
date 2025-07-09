"use client"

import {SidebarGroup, SidebarGroupLabel, SidebarMenu,} from "@/components/ui/sidebar"
import {getUser} from "@/lib/get-user";
import {CogIcon, Database, GalleryVerticalEnd, Languages, SparklesIcon, UsersIcon} from "lucide-react"
import {Suspense, use} from "react";
import {MenuItem} from "@/components/sidebar/type";
import {SingleMenuItem} from "@/components/sidebar/single-menu-item";
import {CollapsableMenuItem} from "@/components/sidebar/collapsible-menu-item";
import {authClient} from "@/lib/auth-client";

const data: MenuItem[] = [
    {
        name: "Alle Marken",
        url: "/dashboard/brands",
        icon: GalleryVerticalEnd,
    },
    {
        name: "Generators",
        icon: SparklesIcon,
        children: [
            {
                name: "SEO Generator",
                url: "/dashboard/content-generation",
            },
            {
                name: "Batch Studio",
                url: "/dashboard/content-generation/batch-studio"
            }
        ]
    },
    {
        name: "Configure",
        url: "/dashboard/configure",
        icon: CogIcon,
    },
    {
        name: "Translations",
        url: "/dashboard/translations",
        icon: Languages,
    },
    {
        name: "Datasources",
        url: "/dashboard/datasources",
        icon: Database,
    },
    {
        name: 'System Prompts',
        url: '/dashboard/prompts',
        icon: SparklesIcon,
        permission: {role: 'admin', permission: {prompt: ['list']}},
    },
    {
        name: "Manage Users",
        url: "/dashboard/users",
        icon: UsersIcon,
        permission: {role: "admin", permission: {users: ["list"]}}
    }
]

export const NavList = () => {
    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
                {data.map((item) => (
                    <Suspense key={item.name}>
                        <Guard item={item}/>
                    </Suspense>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}

const Guard = ({item}: { item: MenuItem }) => {
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
        <>
            {item.children && item.children.length > 0
                ? <CollapsableMenuItem item={item}/>
                : <SingleMenuItem item={item}/>
            }
        </>
    )
}