import { SelectProps } from '@radix-ui/react-select'
import { ComboboxBase } from '@/components/ui/combobox-base'
import { api } from '@/lib/trpc/react'

type BrandSelect = Omit<SelectProps, 'value' | 'onValueChange'> & {
    value?: number
    onValueChange?: (value?: string | number) => void
}

export const BrandSelect = ({ value, onValueChange }: BrandSelect) => {
    const { data } = api.qspayRoute.getAllBrands.useQuery()

    return (
        <ComboboxBase
            labelKey="description"
            valueKey="id"
            data={data?.map((x) => ({ ...x, id: Number(x.id) })) || []}
            value={value}
            onValueChange={onValueChange}
            valueAs="number"
            placeholder="Select a Brand"
            emptyPlaceholder="No brand selected"
        />
    )
}
