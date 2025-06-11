export const Legend = ({children}: { children: React.ReactNode }) => {
    return (
        <div className="relative flex items-center">
            <div className="bg-background pr-3 text-xs text-muted-foreground inline-block z-10 relative">
                {children}
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 w-full h-px bg-muted"/>
        </div>
    )
}
