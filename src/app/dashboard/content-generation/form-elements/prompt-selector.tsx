import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/lib/trpc/react";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

type PromptSelectorType = {
    value: number | undefined
    onChange: (val: number) => void
}

export const PromptSelector = ({value, onChange}: PromptSelectorType) => {
    const [open, setOpen] = React.useState(false)
    const {data} = api.genericRoute.getSystemPrompts.useQuery()

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="flex-1 justify-between"
                >
                    {value
                        ? data?.find((prompt) => prompt.id === value)?.name
                        : "System prompts..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command>
                    <CommandInput placeholder="Search prompts..."/>
                    <CommandList>
                        <CommandEmpty>No prompt found.</CommandEmpty>
                        <CommandGroup>
                            {data?.map((prompt) => (
                                <CommandItem
                                    key={prompt.id}
                                    value={prompt.id.toString()}
                                    keywords={[prompt.name!, prompt.prompt!]}
                                    onSelect={(currentValue) => {
                                        onChange(Number(currentValue))
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === prompt.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold">{prompt.name}</span>
                                        <span className="truncate min-w-0">{prompt.description}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}