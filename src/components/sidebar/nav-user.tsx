"use client"

import { handleLogoutAction } from "@/components/sidebar/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useCustomAction } from "@/hooks/use-custom-action";
import { User } from "better-auth";
import { BadgeCheck, LogOutIcon, MoreVerticalIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes";
import Link from "next/link";
import type * as React from "react";
import { toast } from "sonner";

export function NavUser({
                            user,
                        }: {
    user: User | null
}) {
    const {isMobile} = useSidebar()

    const handleLogoutCall = useCustomAction(handleLogoutAction, {
        onSuccess: () => {
            toast.success("You have successfully logged out.")
        }
    })
    const {setTheme, theme} = useTheme();

    if (!user) return null

    const userInitials = user.name
        .split(" ")
        .map((name) => name.charAt(0).toUpperCase())
        .join("");

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="size-8 rounded-lg">
                                {user.image && <AvatarImage src={user.image} alt={user.name}
                                                            className="aspect-auto object-cover"/>}
                                <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.name}</span>
                                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                            </div>
                            <MoreVerticalIcon className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="size-8 rounded-lg">
                                    {user.image && <AvatarImage src={user.image} alt={user.name}
                                                                className="aspect-auto object-cover"/>}
                                    <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/profile">
                                <BadgeCheck/>
                                Account
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                            <SunIcon/>
                            Switch Theme
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => handleLogoutCall.execute()}>
                            <LogOutIcon/>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
