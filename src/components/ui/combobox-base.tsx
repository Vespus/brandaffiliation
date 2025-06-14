"use client"

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { JSX, useState } from "react";

export const ComboboxBase = <T, >({
                                      data,
                                      placeholder = "Select a value",
                                      emptyPlaceholder = "No value selected",
                                      searchPlaceholder = "Search...",
                                      keywords,
                                      valueDisplayKey,
                                      valueKey,
                                      onValueChange,
                                      value,
                                      itemRenderer,
                                      className,
                                  }:
                                      React.ComponentProps<"button"> & {
                                      valueDisplayKey: keyof T,
                                      valueKey: keyof T,
                                      data: T[],
                                      placeholder?: string,
                                      emptyPlaceholder?: string,
                                      searchPlaceholder?: string,
                                      keywords?: (item: T) => any[],
                                      value?: string | number;
                                      onValueChange?: (value?: string) => void;
                                      itemRenderer?: (item: T) => JSX.Element | null;
                                  }) => {
    const [open, setOpen] = useState(false)

    const selectedValue = data.find(d => d[valueKey] === value)?.[valueDisplayKey] as string || placeholder;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between",
                        className
                    )}
                >
                    {selectedValue}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popper-anchor-width) p-0">
                <Command>
                    <CommandInput placeholder={searchPlaceholder}/>
                    <CommandList>
                        <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
                        <CommandGroup>
                            {data.map((item, index) => (
                                <CommandItem
                                    key={index}
                                    value={(item[valueKey] as string).toString()}
                                    onSelect={(currentValue) => {
                                        onValueChange?.(currentValue === value ? undefined : currentValue)
                                        setOpen(false)
                                    }}
                                    keywords={keywords?.(item)}
                                    className="flex items-start"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 mt-0.5 h-4 w-4",
                                            value === item[valueKey] ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {
                                        itemRenderer ? itemRenderer(item) :
                                            <span>{item[valueDisplayKey] as string}</span>
                                    }
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}