export type MenuItem = {
    name: string
    url?: string
    icon?: React.ComponentType
    permission?: { role: "user" | "admin", permission: Record<string, string[]> },
    children?: MenuItem[]
}