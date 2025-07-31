import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export const HelpTooltip = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <HelpCircle className="text-muted-foreground h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs">{children}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
