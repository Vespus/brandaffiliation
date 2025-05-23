"use client"

import {
    Folder,
    Forward,
    MoreHorizontal,
    Trash2,
    GalleryVerticalEnd,
    CogIcon,
    SparklesIcon,
    Languages
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

const data = [
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
]

export function NavList() {
    const {isMobile} = useSidebar()

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
                {data.map((item) => (
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild>
                            <a href={item.url}>
                                <item.icon/>
                                <span>{item.name}</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
