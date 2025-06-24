import { ComboboxBase } from "@/components/ui/combobox-base";
import { api } from "@/lib/trpc/react";
import { SelectProps } from "@radix-ui/react-select";

type DataSourceSelectorProps = Omit<SelectProps, "value" | "onValueChange"> & {
    value?: number;
    onValueChange?: (value?: number | string) => void;
}

export const DataSourceSelector = ({value, onValueChange}: DataSourceSelectorProps) => {
    const {data: dataSources} = api.genericRoute.getDatasources.useQuery()

    return (
        <ComboboxBase
            labelKey="name"
            valueKey="id"
            data={dataSources || []}
            value={value}
            onValueChange={onValueChange}
            valueAs="number"
            placeholder="Select a Datasource"
            emptyPlaceholder="No Datasource selected"
        />
    )
}