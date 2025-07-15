import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Datasource } from "@/db/types";
import { api } from "@/lib/trpc/react";

interface DatasourceMultiSelectProps {
    value?: { datasourceId: number; values: string[] };
    onChange: (value: { datasourceId: number; values: string[] }) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function DatasourceMultiSelect({
    value,
    onChange,
    placeholder = "Select values",
    disabled = false,
}: DatasourceMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [datasourceOpen, setDatasourceOpen] = useState(false);
    const [selectedDatasourceId, setSelectedDatasourceId] = useState<number | null>(null);
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [selectedLabels, setSelectedLabels] = useState<Record<string, string>>({});

    // Fetch available datasources using tRPC
    const { data: datasourceList = [] } = api.genericRoute.getDatasources.useQuery(
        { isMultiple: true },
        { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
    );

    // Get the selected datasource
    const selectedDatasource = datasourceList.find(d => d.id === selectedDatasourceId) || null;

    // Fetch datasource values when a datasource is selected
    const { data: datasourceValuesData = [], isLoading } = api.genericRoute.getDatasourceValues.useQuery(
        { datasourceId: selectedDatasourceId as number },
        { 
            enabled: !!selectedDatasourceId,
            staleTime: 5 * 60 * 1000 // Cache for 5 minutes
        }
    );

    // Transform datasource values into items for the select
    const datasourceItems = selectedDatasource 
        ? datasourceValuesData.map((item) => {
            const data = item.data as Record<string, string>;
            return {
                value: data[selectedDatasource.valueColumn],
                label: data[selectedDatasource.displayColumn],
            };
        })
        : [];

    // Update selected labels when datasource items change
    useEffect(() => {
        if (datasourceItems.length > 0) {
            const labelsMap: Record<string, string> = {};
            datasourceItems.forEach(item => {
                labelsMap[item.value] = item.label;
            });
            setSelectedLabels(prev => ({ ...prev, ...labelsMap }));
        }
    }, [datasourceItems]);

    // Initialize from value prop
    useEffect(() => {
        if (value?.datasourceId && value.values) {
            setSelectedValues(value.values);
            setSelectedDatasourceId(value.datasourceId);
        }
    }, [value]);

    // Update the parent form when selections change
    useEffect(() => {
        if (selectedDatasource && selectedValues.length > 0) {
            onChange({
                datasourceId: selectedDatasource.id,
                values: selectedValues
            });
        }
    }, [selectedDatasource, selectedValues, onChange]);

    const handleValueSelect = (value: string) => {
        setSelectedValues(prev => {
            if (prev.includes(value)) {
                return prev.filter(v => v !== value);
            } else {
                return [...prev, value];
            }
        });
    };

    const handleRemoveValue = (value: string) => {
        setSelectedValues(prev => prev.filter(v => v !== value));
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-col space-y-2">
                <Popover open={datasourceOpen} onOpenChange={setDatasourceOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={datasourceOpen}
                            className="justify-between"
                            disabled={disabled}
                        >
                            {selectedDatasource
                                ? selectedDatasource.name
                                : "Select datasource"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Search datasources..." />
                            <CommandList>
                                <CommandEmpty>No datasources found.</CommandEmpty>
                                <CommandGroup>
                                    {datasourceList.map((datasource) => (
                                        <CommandItem
                                            key={datasource.id}
                                            value={datasource.name}
                                            onSelect={() => {
                                                setSelectedDatasourceId(datasource.id);
                                                setSelectedValues([]);
                                                setDatasourceOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedDatasourceId === datasource.id
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {datasource.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {selectedDatasource && (
                    <>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="justify-between"
                                    disabled={disabled || isLoading}
                                >
                                    {isLoading
                                        ? "Loading values..."
                                        : selectedValues.length > 0
                                        ? `${selectedValues.length} selected`
                                        : placeholder}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search values..." />
                                    <CommandList>
                                        <CommandEmpty>No values found.</CommandEmpty>
                                        <CommandGroup>
                                            {datasourceItems.map((item) => (
                                                <CommandItem
                                                    key={item.value}
                                                    value={item.label}
                                                    onSelect={() => handleValueSelect(item.value)}
                                                >
                                                    <div className="flex items-center">
                                                        <div
                                                            className={cn(
                                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                                selectedValues.includes(item.value)
                                                                    ? "bg-primary text-primary-foreground"
                                                                    : "opacity-50"
                                                            )}
                                                        >
                                                            {selectedValues.includes(item.value) && (
                                                                <Check className="h-3 w-3" />
                                                            )}
                                                        </div>
                                                        {item.label}
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {selectedValues.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {selectedValues.map((value) => (
                                    <Badge key={value} variant="secondary">
                                        {selectedLabels[value] || value}
                                        <button
                                            className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                                            onClick={() => handleRemoveValue(value)}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
