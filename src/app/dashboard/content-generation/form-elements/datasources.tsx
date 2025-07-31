import { PlusIcon, XIcon } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { DataSourceSelector } from '@/app/dashboard/content-generation/form-elements/datasource-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Legend } from '@/components/ui/legend'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/trpc/react'
import { DataSourceValueSelector } from './datasource-value-selector'

export const DataSources = () => {
    const form = useFormContext()
    const { fields, append, remove } = useFieldArray({
        name: 'dataSources',
        control: form.control,
    })

    return (
        <div className="space-y-4">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="my-4"
                onClick={() =>
                    append({
                        datasourceId: undefined,
                        datasourceValueId: undefined,
                        datasourcePrompt: '',
                    })
                }
            >
                <PlusIcon />
                Add Data Source
            </Button>
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <Card key={field.id}>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <FormField
                                    control={form.control}
                                    name={`dataSources.${index}.datasourceId`}
                                    render={({ field }) => (
                                        <FormItem className="flex-none">
                                            <FormLabel>Source</FormLabel>
                                            <DataSourceSelector onValueChange={field.onChange} value={field.value} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`dataSources.${index}.datasourceValueId`}
                                    render={({ field }) => (
                                        <FormItem className="grow">
                                            <FormLabel>Source Value</FormLabel>
                                            <DataSourceValueSelector
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                index={index}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name={`dataSources.${index}.datasourcePrompt`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User Defined Prompt</FormLabel>
                                        <Textarea
                                            {...field}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Prompt to append to the system prompt"
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Preview index={index} />
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                                <XIcon /> Remove
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}

const Preview = ({ index }: { index: number }) => {
    const form = useFormContext()
    const fieldValues = form.watch('dataSources')
    const dsId = fieldValues[index].datasourceId
    const dsValueId = fieldValues[index].datasourceValueId

    const { data: dataSource } = api.genericRoute.getDatasourceById.useQuery(
        { id: dsId },
        {
            enabled: !!dsId,
        }
    )

    const { data: dataSourceValues } = api.genericRoute.getDatasourceValues.useQuery(
        { datasourceId: dataSource?.id || 0 },
        {
            enabled: !!dataSource,
        }
    )

    const foundDsValue = dataSourceValues?.find((dsValue) => dsValue.id === dsValueId)
    if (!dataSource) {
        return null
    }

    return (
        <div>
            <Legend>Prompt Preview</Legend>
            <div className="mt-2 text-sm">
                {fieldValues[index].datasourcePrompt} :{' '}
                {(foundDsValue?.data as object)?.[dataSource.displayColumn] || 'N/A'}
            </div>
        </div>
    )
}
