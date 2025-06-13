"use client"

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export const ComboboxBase = <T, >({
                                      data,
                                      placeholder = "Select a value",
                                      emptyPlaceholder = "No value selected",
                                      searchPlaceholder = "Search...",
                                      valueDisplayKey,
                                      valueKey,
                                      onValueChange,
                                      value,
                                  }:
                                  {
                                      valueDisplayKey: keyof T,
                                      valueKey: keyof T,
                                      data: T[],
                                      placeholder?: string,
                                      emptyPlaceholder?: string,
                                      searchPlaceholder?: string,
                                      value?: string;
                                      onValueChange?: (value?: string) => void;
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
                    className="w-full justify-between"
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
                                >
                                    {item[valueDisplayKey] as string}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}