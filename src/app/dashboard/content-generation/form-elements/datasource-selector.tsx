import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/lib/trpc/react";
import { cn } from "@/lib/utils";
import { SelectProps } from "@radix-ui/react-select";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

type DataSourceSelectorProps = Omit<SelectProps, "value" | "onValueChange"> & {
    value?: number;
    onValueChange?: (value?: number) => void;
}

export const DataSourceSelector = ({value, onValueChange}: DataSourceSelectorProps) => {
    const {data: dataSources} = api.genericRoute.getDatasources.useQuery()
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
                        ? dataSources?.find((ds) => ds.id === value)?.name
                        : "Select Datasource..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popper-anchor-width) p-0">
                <Command>
                    <CommandInput placeholder="Search Datasources..."/>
                    <CommandList>
                        <CommandEmpty>No Datasource found.</CommandEmpty>
                        <CommandGroup>
                            {dataSources?.map((ds) => (
                                <CommandItem
                                    key={ds.id}
                                    value={ds.id.toString()}
                                    keywords={[ds.name, ds.description || ""]}
                                    onSelect={(currentValue) => {
                                        onValueChange?.(Number(currentValue))
                                        setOpen(false)
                                    }}
                                    className="flex items-start"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 mt-0.5 h-4 w-4",
                                            value === ds.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col space-y-1">
                                        <span>{ds.name}</span>
                                        {
                                            ds.description &&
                                            <span
                                                className="text-muted-foreground text-xs">{ds.description}</span>
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