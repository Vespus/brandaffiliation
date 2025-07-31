import React from 'react'

import { cn } from '@/lib/utils'

export const Legend = ({
    children,
    className,
    contentClassName,
    ...props
}: React.ComponentProps<'div'> & { contentClassName?: string }) => {
    return (
        <div {...props} className={cn('relative flex items-center', className)}>
            <div
                className={cn(
                    'bg-background text-muted-foreground relative z-10 inline-block pr-3 text-xs',
                    contentClassName
                )}
            >
                {children}
            </div>
            <div className="bg-muted absolute top-1/2 right-0 left-0 h-px w-full -translate-y-1/2" />
        </div>
    )
}
