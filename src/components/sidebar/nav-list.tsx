import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { auth } from "@/lib/auth";
import { getUser } from "@/lib/get-user";
import { CogIcon, Database, GalleryVerticalEnd, Languages, SparklesIcon, UsersIcon } from "lucide-react"
import Link from "next/link";
import { Suspense } from "react";

type MenuItem = {
    name: string
    url: string
    icon: React.ComponentType
    permission?: { role: "user" | "admin", permission: Record<string, string[]> }
}

const data: MenuItem[] = [
    {
        name: "Alle Marken",
        url: "/dashboard/brands",
        icon: GalleryVerticalEnd,
    },
    {
        name: "SEO Text Generator",
        url: "/dashboard/content-generation",
        icon: SparklesIcon,
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
        permission: { role: 'admin', permission: { prompt: ['list'] } },
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
                        <NavListItem
                            item={item}
                        />
                    </Suspense>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}

const NavListItem = async ({item}: { item: MenuItem }) => {
    if (item.permission) {
        const {user} = await getUser()
        const {success} = await auth.api.userHasPermission({
            body: {
                userId: user.id,
                role: item.permission.role,
                permission: item.permission.permission
            }
        })

        if (!success) {
            return null
        }
    }

    return (
        <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
                <Link href={item.url}>
                    <item.icon/>
                    <span>{item.name}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}
