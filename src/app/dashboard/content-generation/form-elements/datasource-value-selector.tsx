import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/lib/trpc/react";
import { cn } from "@/lib/utils";
import { SelectProps } from "@radix-ui/react-select";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

type DataSourceValueSelectorProps = Omit<SelectProps, "value" | "onValueChange"> & {
    index: number
    value?: number;
    onValueChange?: (value?: number) => void;
}

export const DataSourceValueSelector = ({value, onValueChange, index}: DataSourceValueSelectorProps) => {
    const [open, setOpen] = useState(false)
    const formContext = useFormContext()
    const dataSourceFormValues = formContext.watch("dataSources") as {datasourceId: number}[]

    const relevantDataSourceId = dataSourceFormValues?.[index]?.datasourceId

    const {data: dataSource} = api.genericRoute.getDatasourceById.useQuery({id: relevantDataSourceId}, {
        enabled: !!relevantDataSourceId
    })
    const {data: dataSourceValues} = api.genericRoute.getDatasourceValues.useQuery({datasourceId: relevantDataSourceId}, {
        enabled: !!relevantDataSourceId
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const selectedValue = dataSource && value && dataSourceValues
        ?.find((dsv) => dsv.id === value)
        ?.data[dataSource.displayColumn] as string | undefined

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedValue || "Select Datasource..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popper-anchor-width) p-0">
                <Command>
                    <CommandInput placeholder="Search Datasources..."/>
                    <CommandList>
                        <CommandEmpty>No Datasource found.</CommandEmpty>
                        <CommandGroup>
                            {dataSource && dataSourceValues?.map((dsv) => (
                                <CommandItem
                                    key={dsv.id}
                                    value={dsv.id.toString()}
                                    keywords={[dsv.data[dataSource.displayColumn]]}
                                    onSelect={(currentValue) => {
                                        onValueChange?.(Number(currentValue) === value ? undefined : Number(currentValue))
                                        setOpen(false)
                                    }}
                                    className="flex items-start"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 mt-0.5 h-4 w-4",
                                            value === dsv.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col space-y-1">
                                        <span>{dsv.data[dataSource.displayColumn]}</span>
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