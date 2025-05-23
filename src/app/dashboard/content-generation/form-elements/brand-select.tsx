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

type BrandSelect = Omit<SelectProps, "value" | "onValueChange"> & {
    value?: number;
    onValueChange?: (value?: number) => void;
}

export const BrandSelect = ({value, onValueChange}: BrandSelect) => {
    const {data} = api.genericRoute.getBrandsWithCharacteristics.useQuery()
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
                        ? data?.find((brand) => brand.id === value)?.name
                        : "Select Brand..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popper-anchor-width) p-0">
                <Command>
                    <CommandInput placeholder="Search brands..."/>
                    <CommandList>
                        <CommandEmpty>No framework found.</CommandEmpty>
                        <CommandGroup>
                            {data?.map((brand) => (
                                <CommandItem
                                    key={brand.id}
                                    value={brand.id.toString()}
                                    keywords={[brand.name]}
                                    onSelect={(currentValue) => {
                                        onValueChange?.(Number(currentValue) === value ? undefined : Number(currentValue))
                                        setOpen(false)
                                    }}
                                    className="flex items-start"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 mt-0.5 h-4 w-4",
                                            value === brand.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col space-y-1">
                                        <span>{brand.name}</span>
                                        {
                                            brand.characteristics[0] &&
                                            <span
                                                className="text-muted-foreground text-xs">{brand.characteristics[0].value}</span>
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