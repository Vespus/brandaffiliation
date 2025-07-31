'use client';

import { useEffect, useState } from 'react';



import { zodResolver } from '@hookform/resolvers/zod';
import Papa from 'papaparse';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useDatasourceParams } from '@/app/dashboard/datasources/use-datasource-params';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCustomAction } from '@/hooks/use-custom-action';
import { api } from '@/lib/trpc/react';
import { updateDatasource } from './actions';


// Schema for the form validation
const formSchema = z.object({
    id: z.number(),
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    description: z.string().optional(),
    valueColumn: z.string().min(1, 'Value column is required'),
    displayColumn: z.string().min(1, 'Display column is required'),
    isMultiple: z.boolean(),
    csvFile: z.instanceof(File).optional(),
})

type FormValues = z.infer<typeof formSchema>

export function DatasourceEditDialog() {
    const { editDatasource, setParams } = useDatasourceParams()
    const isOpen = Boolean(editDatasource)
    const [csvHeaders, setCsvHeaders] = useState<string[]>([])
    const [csvData, setCsvData] = useState<Record<string, string>[]>([])
    const [isParsingCsv, setIsParsingCsv] = useState(false)

    const { data, isPending } = api.genericRoute.getDatasourceById.useQuery(
        { id: editDatasource as number },
        {
            enabled: isOpen,
        }
    )

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: 0,
            name: '',
            description: '',
            valueColumn: '',
            displayColumn: '',
            isMultiple: false,
        },
    })

    // Reset form when datasource changes
    useEffect(() => {
        if (data) {
            form.reset({
                id: data.id,
                name: data.name,
                description: data.description || '',
                valueColumn: data.valueColumn,
                displayColumn: data.displayColumn,
                isMultiple: data.isMultiple || false,
            })
        }
    }, [data, form])

    // Handle CSV file upload
    const handleCsvUpload = (file: File) => {
        setIsParsingCsv(true)

        Papa.parse(file, {
            header: true,
            complete: (results) => {
                if (results.data.length > 0 && results.meta.fields) {
                    setCsvHeaders(results.meta.fields)
                    setCsvData(results.data as Record<string, string>[])

                    // Update form values if needed
                    if (!csvHeaders.includes(form.getValues('valueColumn'))) {
                        form.setValue('valueColumn', results.meta.fields[0])
                    }
                    if (!csvHeaders.includes(form.getValues('displayColumn'))) {
                        form.setValue('displayColumn', results.meta.fields[0])
                    }
                }
                setIsParsingCsv(false)
            },
            error: (error) => {
                toast.error(`Error parsing CSV: ${error.message}`)
                setIsParsingCsv(false)
            },
        })
    }

    const updateDatasourceAction = useCustomAction(updateDatasource, {
        onSuccess: ({ data }) => {
            toast.success(data?.message)
            setParams(null)
        },
    })

    const onSubmit = (values: FormValues) => {
        // If no new CSV file was uploaded, we don't have csvData
        // In that case, we'll just update the metadata
        updateDatasourceAction.execute({
            id: values.id,
            name: values.name,
            description: values.description,
            valueColumn: values.valueColumn,
            displayColumn: values.displayColumn,
            isMultiple: values.isMultiple,
            columns: csvHeaders,
            csvData: csvData.length > 0 ? csvData : [], // Only send data if we have new CSV
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => setParams(null)}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Datasource</DialogTitle>
                    <DialogDescription>Update datasource information</DialogDescription>
                </DialogHeader>
                {isPending ? (
                    <div className="flex justify-center py-4">Loading...</div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isMultiple"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Allow Multiple Selection</FormLabel>
                                            <p className="text-muted-foreground text-sm">
                                                Enable this if users should be able to select multiple values from this
                                                datasource
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="csvFile"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormLabel>Upload New CSV (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept=".csv"
                                                onChange={(e) => {
                                                    void value
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        onChange(file)
                                                        handleCsvUpload(file)
                                                    }
                                                }}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {data && data.columns.length > 0 && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="valueColumn"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Value Column</FormLabel>
                                                <FormControl>
                                                    <select
                                                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                        {...field}
                                                    >
                                                        {data.columns.map((header) => (
                                                            <option key={header} value={header}>
                                                                {header}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="displayColumn"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Display Column</FormLabel>
                                                <FormControl>
                                                    <select
                                                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                                        {...field}
                                                    >
                                                        {data.columns.map((header) => (
                                                            <option key={header} value={header}>
                                                                {header}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline" onClick={() => setParams(null)}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" loading={updateDatasourceAction.isPending || isParsingCsv}>
                                    Update
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}
