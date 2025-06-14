import { ComboboxBase } from "@/components/ui/combobox-base";
import { api } from "@/lib/trpc/react";
import { SelectProps } from "@radix-ui/react-select";

type DataSourceSelectorProps = Omit<SelectProps, "value" | "onValueChange"> & {
    value?: number;
    onValueChange?: (value?: number) => void;
}

export const DataSourceSelector = ({value, onValueChange}: DataSourceSelectorProps) => {
    const {data: dataSources} = api.genericRoute.getDatasources.useQuery()

    return (
        <ComboboxBase
            valueDisplayKey="name"
            valueKey="id"
            data={dataSources || []}
            value={value}
            onValueChange={(val) => onValueChange?.(Number(val))}
            placeholder="Select a Datasource"
            emptyPlaceholder="No Datasource selected"
        />
    )
}