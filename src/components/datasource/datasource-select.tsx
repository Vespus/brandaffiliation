import { useState } from 'react'

import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { api } from '@/lib/trpc/react'
import { cn } from '@/lib/utils'

interface DatasourceSelectProps {
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
}

export function DatasourceSelect({
    value,
    onChange,
    placeholder = 'Select a value',
    disabled = false,
}: DatasourceSelectProps) {
    const [open, setOpen] = useState(false)
    const [selectedDatasourceId, setSelectedDatasourceId] = useState<number | null>(null)

    // Fetch available datasources using tRPC
    const { data: datasourceList = [] } = api.genericRoute.getDatasources.useQuery(
        { isMultiple: false },
        { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
    )

    // Get the selected datasource
    const selectedDatasource = datasourceList.find((d) => d.id === selectedDatasourceId) || null

    // Fetch datasource values when a datasource is selected
    const { data: datasourceValuesData = [], isLoading } = api.genericRoute.getDatasourceValues.useQuery(
        { datasourceId: selectedDatasourceId as number },
        {
            enabled: !!selectedDatasourceId,
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        }
    )

    // Transform datasource values into items for the select
    const datasourceItems = selectedDatasource
        ? datasourceValuesData.map((item) => {
              const data = item.data as Record<string, string>
              return {
                  value: data[selectedDatasource.valueColumn],
                  label: data[selectedDatasource.displayColumn],
              }
          })
        : []

    return (
        <div className="space-y-2">
            <div className="flex flex-col space-y-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="justify-between"
                            disabled={disabled}
                        >
                            {selectedDatasource ? selectedDatasource.name : 'Select datasource'}
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
                                                setSelectedDatasourceId(datasource.id)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4',
                                                    selectedDatasourceId === datasource.id ? 'opacity-100' : 'opacity-0'
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
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className="justify-between"
                                disabled={disabled || isLoading}
                            >
                                {isLoading
                                    ? 'Loading values...'
                                    : value
                                      ? datasourceItems.find((item) => item.value === value)?.label || value
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
                                                onSelect={() => {
                                                    onChange(item.value)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        value === item.value ? 'opacity-100' : 'opacity-0'
                                                    )}
                                                />
                                                {item.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        </div>
    )
}
