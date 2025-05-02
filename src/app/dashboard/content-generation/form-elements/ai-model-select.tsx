import {SelectProps} from "@radix-ui/react-select";
import {api} from "@/lib/trpc/react";
import {Check, ChevronsUpDown} from "lucide-react";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import {cn} from "@/lib/utils";
import {ProviderIcon} from "@/app/dashboard/content-generation/form-elements/provider-icon";

type AIModelSelectType = Omit<SelectProps, "value" | "onValueChange"> & {
    value?: number;
    onValueChange?: (value?: number) => void;
}

export const AIModelSelect = ({value, onValueChange}: AIModelSelectType) => {
    const {data} = api.genericRoute.getAIModels.useQuery()
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? data?.find((model) => model.id === value)?.name
                        : "Select model..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popper-anchor-width) p-0">
                <Command>
                    <CommandInput placeholder="Search models..."/>
                    <CommandList>
                        <CommandEmpty>No framework found.</CommandEmpty>
                        <CommandGroup>
                            {data?.map((model) => (
                                <CommandItem
                                    key={model.id}
                                    value={model.id.toString()}
                                    keywords={[model.name]}
                                    onSelect={(currentValue) => {
                                        onValueChange?.(Number(currentValue) === value ? undefined : Number(currentValue))
                                        setOpen(false)
                                    }}
                                    className="flex items-start"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 mt-0.5 h-4 w-4",
                                            value === model.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <ProviderIcon providerCode={model.provider.code}/>
                                            <span>{model.name}</span>
                                        </div>
                                        {
                                            model.description &&
                                            <span className="text-muted-foreground text-xs">{model.description}</span>
                                        }
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