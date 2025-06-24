import { ComboboxBase } from "@/components/ui/combobox-base";
import { api } from "@/lib/trpc/react";
import { SelectProps } from "@radix-ui/react-select";

type BrandSelect = Omit<SelectProps, "value" | "onValueChange"> & {
    value?: string;
    onValueChange?: (value?: string) => void;
}

export const BrandSelect = ({value, onValueChange}: BrandSelect) => {
    const {data} = api.qspayRoute.getAllBrands.useQuery()

    return (
        <ComboboxBase
            labelKey="description"
            valueKey="id"
            data={data || []}
            value={value}
            onValueChange={(val) => onValueChange?.(val)}
            placeholder="Select a Brand"
            emptyPlaceholder="No brand selected"
        />
    )
}