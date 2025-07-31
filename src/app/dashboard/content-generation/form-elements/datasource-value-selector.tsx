import { SelectProps } from '@radix-ui/react-select'
import { useFormContext } from 'react-hook-form'
import { ComboboxBase } from '@/components/ui/combobox-base'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/trpc/react'

type DataSourceValueSelectorProps = Omit<SelectProps, 'value' | 'onValueChange'> & {
    index: number
    value?: number
    onValueChange?: (value?: number | string) => void
}

export const DataSourceValueSelector = ({ value, onValueChange, index }: DataSourceValueSelectorProps) => {
    const formContext = useFormContext()
    const dataSourceFormValues = formContext.watch('dataSources') as { datasourceId: number }[]

    const relevantDataSourceId = dataSourceFormValues?.[index]?.datasourceId

    const { data: dataSource } = api.genericRoute.getDatasourceById.useQuery(
        { id: relevantDataSourceId },
        {
            enabled: !!relevantDataSourceId,
        }
    )
    const { data: dataSourceValues } = api.genericRoute.getDatasourceValues.useQuery(
        { datasourceId: relevantDataSourceId },
        {
            enabled: !!relevantDataSourceId,
        }
    )

    const selectedValue =
        dataSource && value
            ? (dataSourceValues?.find(dsv => dsv.id === value)?.data[dataSource.displayColumn] as string | undefined)
            : undefined

    if (!dataSource) {
        return <Skeleton className="flex h-9 w-full items-center px-3 text-xs">Waiting for datasource</Skeleton>
    }

    return (
        <ComboboxBase
            data={dataSourceValues || []}
            valueKey="id"
            labelKey={dataSource.displayColumn as keyof typeof dataSourceValues}
            valueAs="number"
            value={value}
            maskedValue={selectedValue}
            onValueChange={onValueChange}
            itemRendererContainerHeight={56}
            itemRenderer={(item) => {
                if (
                    !item.data ||
                    !(item.data as object)[dataSource.valueColumn] ||
                    !(item.data as object)[dataSource.displayColumn]
                ) {
                    return (
                        <span className="text-muted-foreground flex items-center" style={{ height: '56px' }}>
                            Undefined
                        </span>
                    )
                }
                return (
                    <div className="flex min-w-0 flex-col gap-2">
                        {(item.data as object)[dataSource.displayColumn] && (
                            <span>{(item.data as object)[dataSource.displayColumn]}</span>
                        )}
                        <span className="text-muted-foreground truncate text-xs">
                            Value: {(item.data as object)[dataSource.valueColumn]}
                        </span>
                    </div>
                )
            }}
        />
    )
}
