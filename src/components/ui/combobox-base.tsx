import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from 'react';

type VirtualizedCommandProps<T> = {
    height?: string;
    data: T[];
    valueKey: keyof T;
    labelKey: keyof T;
    valueAs?: "string" | "number";
    itemRenderer?: (item: T) => React.JSX.Element | null;
    itemRendererContainerHeight?: number
    value?: string | number;
    placeholder?: string;
    emptyPlaceholder?: string;
    searchPlaceholder?: string
    onValueChange?: (value?: string | number) => void
    setOpen: (open: boolean) => void;
}

const VirtualizedCommand = <T, >({
                                     height = "400px",
                                     data,
                                     valueKey,
                                     labelKey,
                                     itemRenderer,
                                     itemRendererContainerHeight = 35,
                                     onValueChange,
                                     value,
                                     valueAs,
                                     emptyPlaceholder = "No Item Selected",
                                     searchPlaceholder = "Search Item...",
                                     setOpen,
                                 }: VirtualizedCommandProps<T>) => {
    const [filteredOptions, setFilteredOptions] = React.useState<T[]>(data);
    const [focusedIndex, setFocusedIndex] = React.useState(0);
    const [isKeyboardNavActive, setIsKeyboardNavActive] = React.useState(false);

    const parentRef = React.useRef(null);
    const virtualizer = useVirtualizer({
        count: filteredOptions.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => itemRendererContainerHeight,
    });
    const virtualOptions = virtualizer.getVirtualItems();
    const scrollToIndex = (index: number) => {
        virtualizer.scrollToIndex(index, {
            align: 'center',
        });
    };
    const handleSearch = (search: string) => {
        setIsKeyboardNavActive(false);
        setFilteredOptions(
            data.filter(
                (option) =>
                    (option[valueKey] as string).toString().toLowerCase().includes(search.toLowerCase()) ||
                    (option[labelKey] as string).toString().toLowerCase().includes(search.toLowerCase())
            ),
        );
    };
    const handleKeyDown = (event: React.KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowDown': {
                event.preventDefault();
                setIsKeyboardNavActive(true);
                setFocusedIndex((prev) => {
                    const newIndex = prev === -1 ? 0 : Math.min(prev + 1, filteredOptions.length - 1);
                    scrollToIndex(newIndex);
                    return newIndex;
                });
                break;
            }
            case 'ArrowUp': {
                event.preventDefault();
                setIsKeyboardNavActive(true);
                setFocusedIndex((prev) => {
                    const newIndex = prev === -1 ? filteredOptions.length - 1 : Math.max(prev - 1, 0);
                    scrollToIndex(newIndex);
                    return newIndex;
                });
                break;
            }
            case 'Enter': {
                event.preventDefault();
                if (filteredOptions[focusedIndex]) {
                    const currentValue = filteredOptions[focusedIndex][valueKey] as string
                    onValueChange?.(currentValue === value ? undefined : currentValue);
                }
                break;
            }
            default:
                break;
        }
    };

    React.useEffect(() => {
        if (value) {
            const option = filteredOptions.find((option) => (option[valueKey] as string) === value);
            if (option) {
                const index = filteredOptions.indexOf(option);
                setFocusedIndex(index);
                virtualizer.scrollToIndex(index, {
                    align: 'center',
                });
            }
        }
    }, [value, filteredOptions, virtualizer]);

    return (
        <Command shouldFilter={false} onKeyDown={handleKeyDown}>
            <CommandInput onValueChange={handleSearch} placeholder={searchPlaceholder}/>
            <CommandList
                ref={parentRef}
                style={{
                    height: height,
                    width: '100%',
                    overflow: 'auto',
                }}
                onMouseDown={() => setIsKeyboardNavActive(false)}
                onMouseMove={() => setIsKeyboardNavActive(false)}
            >
                <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
                <CommandGroup>
                    <div
                        style={{
                            height: `${virtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {virtualOptions.map((virtualOption) => (
                            <CommandItem
                                key={filteredOptions[virtualOption.index][valueKey] as string}
                                disabled={isKeyboardNavActive}
                                className={cn(
                                    'absolute left-0 top-0 w-full bg-transparent',
                                    focusedIndex === virtualOption.index && 'bg-accent',
                                    isKeyboardNavActive &&
                                    focusedIndex !== virtualOption.index &&
                                    'aria-selected:bg-transparent aria-selected:text-primary',
                                )}
                                style={{
                                    height: `${virtualOption.size}px`,
                                    transform: `translateY(${virtualOption.start}px)`,
                                }}
                                value={(filteredOptions[virtualOption.index][valueKey] as string).toString()}
                                onMouseEnter={() => !isKeyboardNavActive && setFocusedIndex(virtualOption.index)}
                                onMouseLeave={() => !isKeyboardNavActive && setFocusedIndex(-1)}
                                onSelect={currentValue => {
                                    if (valueAs === "number") {
                                        onValueChange?.(Number(currentValue) === value ? undefined : Number(currentValue))
                                    } else {
                                        onValueChange?.(currentValue === value ? undefined : currentValue)
                                    }
                                    setOpen(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        value === filteredOptions[virtualOption.index][valueKey] as string
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                    )}
                                />
                                {
                                    itemRenderer ? itemRenderer(filteredOptions[virtualOption.index]) :
                                        <span>{filteredOptions[virtualOption.index][labelKey] as string}</span>
                                }
                            </CommandItem>
                        ))}
                    </div>
                </CommandGroup>
            </CommandList>
        </Command>
    );
};

export const ComboboxBase = <T, >({
                                      data,
                                      value,
                                      valueKey,
                                      labelKey,
                                      valueAs = "string",
                                      placeholder = "Select Item...",
                                      maskedValue,
                                      ...props
                                  }: Omit<VirtualizedCommandProps<T>, "setOpen"> & { maskedValue?: any }) => {

    const [open, setOpen] = React.useState(false);
    const selectedValue = data.find(d => d[valueKey] === value)?.[labelKey] as string || placeholder;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {maskedValue || selectedValue}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popper-anchor-width) p-0">
                <VirtualizedCommand
                    data={data}
                    valueKey={valueKey}
                    labelKey={labelKey}
                    value={value}
                    valueAs={valueAs}
                    setOpen={setOpen}
                    {...props}
                />
            </PopoverContent>
        </Popover>
    );
}