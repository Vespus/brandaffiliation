import {
    TooltipProvider,
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip";
import {HelpCircle} from "lucide-react";

export const HelpTooltip = ({children}: Readonly<{ children: React.ReactNode; }>) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs">
                        {children}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}