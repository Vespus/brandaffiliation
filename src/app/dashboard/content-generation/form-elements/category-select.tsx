import {SelectProps} from "@radix-ui/react-select";
import {api} from "@/lib/trpc/react";
import {Check, ChevronsUpDown} from "lucide-react";
import {useState} from "react";
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

export const CategorySelect = ({value, onValueChange}: SelectProps) => {
    const {data} = api.genericRoute.getCategories.useQuery()
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
                        ? data?.find((category) => category.id === value)?.name
                        : "Select category..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popper-anchor-width) p-0">
                <Command>
                    <CommandInput placeholder="Search categories..."/>
                    <CommandList>
                        <CommandEmpty>No framework found.</CommandEmpty>
                        <CommandGroup>
                            {data?.map((category) => (
                                <CommandItem
                                    key={category.id}
                                    value={category.id.toString()}
                                    keywords={[category.name, ...category.seoKeywords]}
                                    onSelect={(currentValue) => {
                                        onValueChange?.(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 mt-0.5 h-4 w-4",
                                            value === category.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {category.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}